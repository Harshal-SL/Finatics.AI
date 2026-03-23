const { appDb } = require('../config/supabase');

/**
 * User Profile Controller
 * Handles user profile operations using Supabase Application Database
 */

/**
 * Get user profile information
 * Combines data from auth_users and user_profiles tables
 */
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user from auth_users table
    const { data: authUser, error: authError } = await appDb
      .from('auth_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (authError) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: authError.message
      });
    }

    // Get user profile from user_profiles table
    const { data: profile, error: profileError } = await appDb
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Profile might not exist yet, so don't treat as error
    const userProfile = {
      ...authUser,
      profile: profile || null,
      profileCompleted: !!profile
    };

    res.json({
      success: true,
      data: userProfile
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Update user profile
 * Updates both auth_users and user_profiles tables
 */
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      first_name,
      last_name,
      phone,
      date_of_birth,
      occupation,
      monthly_income,
      financial_goals
    } = req.body;

    // Update auth_users table if name fields provided
    if (first_name || last_name) {
      const { error: authUpdateError } = await appDb
        .from('auth_users')
        .update({
          first_name,
          last_name,
          profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (authUpdateError) {
        return res.status(400).json({
          success: false,
          message: 'Failed to update user information',
          error: authUpdateError.message
        });
      }
    }

    // Update or insert user profile
    const profileData = {
      user_id: userId,
      phone,
      date_of_birth,
      occupation,
      monthly_income,
      financial_goals,
      updated_at: new Date().toISOString()
    };

    // Try to update first, if no rows affected, insert
    const { data: updateResult, error: updateError } = await appDb
      .from('user_profiles')
      .upsert(profileData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update profile',
        error: updateError.message
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updateResult
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Create or update user PIN
 */
const updateUserPin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { pin } = req.body;

    if (!pin || pin.length !== 4) {
      return res.status(400).json({
        success: false,
        message: 'PIN must be exactly 4 digits'
      });
    }

    // Hash the PIN (in production, use bcrypt)
    const bcrypt = require('bcrypt');
    const pinHash = await bcrypt.hash(pin, 10);

    // Update or insert PIN
    const { data, error } = await appDb
      .from('user_pins')
      .upsert({
        user_id: userId,
        pin_hash: pinHash,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update PIN',
        error: error.message
      });
    }

    // Update auth_users to mark PIN as created
    await appDb
      .from('auth_users')
      .update({
        pin_created: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    res.json({
      success: true,
      message: 'PIN updated successfully'
    });

  } catch (error) {
    console.error('Error updating PIN:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get user's linked bank accounts
 */
const getLinkedAccounts = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: linkedAccounts, error } = await appDb
      .from('linkedbankaccounts')
      .select('*')
      .eq('user_id', userId)
      .order('linked_at', { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch linked accounts',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: linkedAccounts
    });

  } catch (error) {
    console.error('Error fetching linked accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Link a bank account to user
 */
const linkBankAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    const { account_ref_id } = req.body;

    if (!account_ref_id) {
      return res.status(400).json({
        success: false,
        message: 'Account reference ID is required'
      });
    }

    const { data, error } = await appDb
      .from('linkedbankaccounts')
      .insert({
        user_id: userId,
        account_ref_id,
        linked_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to link bank account',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Bank account linked successfully',
      data
    });

  } catch (error) {
    console.error('Error linking bank account:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateUserPin,
  getLinkedAccounts,
  linkBankAccount
};