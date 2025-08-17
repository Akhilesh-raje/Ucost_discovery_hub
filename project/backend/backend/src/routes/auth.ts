import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Simple in-memory storage for credentials (in production, use database)
let storedCredentials: Array<{username: string, password: string, createdAt: Date}> = [];

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email }
    });

    if (!adminUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: adminUser.id, 
        email: adminUser.email,
        role: adminUser.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!adminUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: adminUser });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create admin user (protected route)
router.post('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email, password, role = 'admin' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      return res.status(409).json({ error: 'Admin user already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const newAdmin = await prisma.adminUser.create({
      data: {
        email,
        password: passwordHash,
        role,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Admin user created successfully',
      user: newAdmin
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify secret code endpoint (only checks time, doesn't set credentials)
router.post('/verify-secret-code', async (req, res) => {
  try {
    const { secretCode } = req.body;

    if (!secretCode) {
      return res.status(400).json({ error: 'Secret code is required' });
    }

    // Get current time in 12-hour format
    const now = new Date();
    const hours = now.getHours() % 12 || 12; // Convert to 12-hour format
    const minutes = now.getMinutes();
    const currentTimeCode = `${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`;

    // Verify secret code (current time)
    if (secretCode !== currentTimeCode) {
      return res.status(401).json({ 
        error: 'Invalid secret code',
        hint: `Current time code: ${currentTimeCode}`
      });
    }

    res.json({
      message: 'Secret code verified successfully',
      verified: true
    });
  } catch (error) {
    console.error('Verify secret code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint for secret code verification (no database required)
router.post('/test-reset-credentials', async (req, res) => {
  try {
    const { secretCode, newUsername, newPassword } = req.body;

    if (!secretCode) {
      return res.status(400).json({ error: 'Secret code is required' });
    }

    // Get current time in 12-hour format
    const now = new Date();
    const hours = now.getHours() % 12 || 12; // Convert to 12-hour format
    const minutes = now.getMinutes();
    const currentTimeCode = `${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`;

    // Verify secret code (current time)
    if (secretCode !== currentTimeCode) {
      return res.status(401).json({ 
        error: 'Invalid secret code',
        hint: `Current time code: ${currentTimeCode}`
      });
    }

    // Check if new credentials are provided
    if (!newUsername || !newPassword) {
      return res.status(400).json({ error: 'New username and password are required' });
    }

    // Validate credentials (simple validation)
    if (newUsername.length < 3 || newPassword.length < 6) {
      return res.status(400).json({ error: 'Username must be at least 3 characters and password at least 6 characters' });
    }

    // Check if we already have 5 sets of credentials
    if (storedCredentials.length >= 5) {
      return res.status(400).json({ error: 'Maximum 5 sets of credentials allowed. Please remove some existing credentials first.' });
    }

    // Add new credentials to storage
    storedCredentials.push({
      username: newUsername,
      password: newPassword,
      createdAt: new Date()
    });

    res.json({
      message: 'Credentials set successfully',
      credentials: {
        username: newUsername,
        password: newPassword
      },
      masterCredentials: {
        username: 'adminucost',
        password: 'ucost@2025',
        encoded: 'YWRtaW51Y29zdDp1Y29zdEAyMDI1' // base64 encoded
      },
      totalCredentials: storedCredentials.length,
      maxCredentials: 5
    });
  } catch (error) {
    console.error('Test reset credentials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all stored credentials (for admin view)
router.get('/stored-credentials', async (req, res) => {
  try {
    res.json({
      credentials: storedCredentials,
      total: storedCredentials.length,
      max: 5
    });
  } catch (error) {
    console.error('Get stored credentials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset admin credentials with secret code
router.post('/reset-credentials', async (req, res) => {
  try {
    const { secretCode } = req.body;

    if (!secretCode) {
      return res.status(400).json({ error: 'Secret code is required' });
    }

    // Verify secret code
    if (secretCode !== '0000') {
      return res.status(401).json({ error: 'Invalid secret code' });
    }

    // Generate new credentials
    const newUsername = `admin_${Math.random().toString(36).substr(2, 6)}`;
    const newPassword = Math.random().toString(36).substr(2, 8) + '!@#';
    
    // Hash the new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Find the first admin user or create one if none exists
    let adminUser = await prisma.adminUser.findFirst();
    
    if (adminUser) {
      // Update existing admin user
      adminUser = await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: {
          email: newUsername,
          password: passwordHash
        },
        select: {
          id: true,
          email: true,
          password: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } else {
      // Create new admin user
      adminUser = await prisma.adminUser.create({
        data: {
          email: newUsername,
          password: passwordHash,
          role: 'admin',
          isActive: true
        },
        select: {
          id: true,
          email: true,
          password: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });
    }

    res.json({
      message: 'Credentials reset successfully',
      credentials: {
        username: newUsername,
        password: newPassword
      },
      user: adminUser
    });
  } catch (error) {
    console.error('Reset credentials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// UCOST Software Verification endpoint
router.post('/verify-ucost', async (req: any, res: any) => {
  try {
    const { softwareId, version, deviceId, capabilities } = req.body;
    const softwareIdHeader = req.headers['x-ucost-software-id'];
    const versionHeader = req.headers['x-ucost-version'];
    const deviceIdHeader = req.headers['x-ucost-device-id'];

    console.log('🔍 P2P Device Verification Request:', {
      softwareId,
      version,
      deviceId,
      capabilities,
      headers: {
        softwareIdHeader,
        versionHeader,
        deviceIdHeader
      }
    });

    // Verify software ID
    if (softwareId !== 'UCOST_DISCOVERY_HUB' || softwareIdHeader !== 'UCOST_DISCOVERY_HUB') {
      console.log('❌ Unauthorized software ID:', softwareId);
      return res.status(401).json({
        success: false,
        isAuthorized: false,
        error: 'Unauthorized software'
      });
    }

    // Verify version compatibility (basic check)
    if (!version || !versionHeader) {
      console.log('❌ Missing version information');
      return res.status(400).json({
        success: false,
        isAuthorized: false,
        error: 'Missing version information'
      });
    }

    // Verify device ID
    if (!deviceId || !deviceIdHeader) {
      console.log('❌ Missing device ID');
      return res.status(400).json({
        success: false,
        isAuthorized: false,
        error: 'Missing device ID'
      });
    }

    // Verify capabilities
    if (!capabilities || !Array.isArray(capabilities)) {
      console.log('❌ Invalid capabilities');
      return res.status(400).json({
        success: false,
        isAuthorized: false,
        error: 'Invalid capabilities'
      });
    }

    // All checks passed - device is authorized
    console.log('✅ P2P Device Authorized:', {
      deviceId,
      version,
      capabilities
    });

    res.json({
      success: true,
      isAuthorized: true,
      softwareId: 'UCOST_DISCOVERY_HUB',
      version: '1.0.0',
      message: 'Device verified successfully',
      serverCapabilities: ['exhibits', 'tours', 'analytics', 'admin'],
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ P2P Verification Error:', error);
    res.status(500).json({
      success: false,
      isAuthorized: false,
      error: 'Verification failed'
    });
  }
});

// System Information Endpoint for P2P
router.get('/system/local-ip', async (req: any, res: any) => {
  try {
    // Get actual local IP address
    const os = require('os');
    const interfaces = os.networkInterfaces();
    let localIP = '127.0.0.1'; // Default fallback
    
    // Find the first non-internal IPv4 address
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
        if (iface.family === 'IPv4' && !iface.internal) {
          localIP = iface.address;
          break;
        }
      }
      if (localIP !== '127.0.0.1') break;
    }
    
    console.log('🌐 Local IP detected:', localIP);
    
    res.json({
      success: true,
      ip: localIP,
      networkInterfaces: Object.keys(interfaces),
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Local IP Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get local IP'
    });
  }
});

export default router; 