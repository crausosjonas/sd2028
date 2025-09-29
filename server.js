require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
// The PORT environment variable is set by Render automatically.
const port = process.env.PORT || 3001;

// --- Database Connection ---
// The pool will use the DATABASE_URL from the .env file (for local) or
// the environment variable set in Render (for production).
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Add SSL configuration for production database on Render
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// --- Middleware ---
app.use(cors()); // Allow requests from your frontend
app.use(express.json()); // Allow the server to read JSON from request bodies

// --- API Endpoints ---

/**
 * @route   POST /auth/facebook
 * @desc    Authenticates a user with a Facebook access token. If the user is new,
 *          it creates an account. The first user to ever sign up becomes an admin.
 * @access  Public
 */
app.post('/auth/facebook', async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ message: 'Access token is required.' });
  }

  try {
    // 1. Verify access token with Facebook by fetching the user's profile
    const fbResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.width(400).height(400)&access_token=${accessToken}`);
    const fbUserData = await fbResponse.json();

    if (fbUserData.error) {
      console.error('Facebook API error:', fbUserData.error);
      return res.status(400).json({ message: 'Invalid or expired Facebook access token.' });
    }

    // 2. Check if the user already exists in our database
    const userResult = await pool.query('SELECT * FROM users WHERE facebook_id = $1', [fbUserData.id]);
    
    if (userResult.rows.length > 0) {
      // User exists, so we return their data
      console.log(`User '${fbUserData.name}' logged in.`);
      res.status(200).json(userResult.rows[0]);
    } else {
      // User is new, so we create a new record
      console.log(`New user '${fbUserData.name}' signing up.`);
      
      // Check if this is the very first user to determine their role
      const totalUsersResult = await pool.query('SELECT COUNT(*) FROM users');
      const isFirstUser = parseInt(totalUsersResult.rows[0].count, 10) === 0;
      const role = isFirstUser ? 'admin' : 'member';
      
      console.log(`Assigning role: ${role}`);

      const newUserResult = await pool.query(
        'INSERT INTO users (facebook_id, name, email, picture, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [fbUserData.id, fbUserData.name, fbUserData.email, fbUserData.picture.data.url, role]
      );
      res.status(201).json(newUserResult.rows[0]);
    }
  } catch (error) {
    console.error('Error during Facebook authentication:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @route   GET /users
 * @desc    Gets all users (for the admin panel).
 * @access  Protected (should be admin-only in a real app)
 */
app.get('/users', async (req, res) => {
    // NOTE: In a production app, you would add authentication middleware here
    // to verify that the request is coming from a logged-in admin user.
    try {
        const usersResult = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        res.status(200).json(usersResult.rows);
    } catch(error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

/**
 * @route   PUT /users/:id/role
 * @desc    Updates a user's role (for the admin panel).
 * @access  Protected (should be admin-only in a real app)
 */
app.put('/users/:id/role', async (req, res) => {
    // NOTE: In a production app, you would add authentication middleware here.
    const { id } = req.params;
    const { role } = req.body;

    if (role !== 'convenor' && role !== 'member') {
        return res.status(400).json({ message: "Invalid role specified. Can only be 'convenor' or 'member'." });
    }

    try {
        // We add "AND role != 'admin'" to prevent an admin from being demoted.
        const updatedUserResult = await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2 AND role != \'admin\' RETURNING *',
            [role, id]
        );

        if (updatedUserResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found or the user is an admin who cannot be demoted.' });
        }
        res.status(200).json(updatedUserResult.rows[0]);
    } catch(error) {
        console.error(`Error updating role for user ${id}:`, error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


// --- Server Start ---
// Render provides its own SSL termination, so we run a standard HTTP server.
// Render will automatically expose it securely on port 443 (HTTPS).
app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});