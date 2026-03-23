const goalAnalyzerService = require('../services/goalAnalyzerService');
const { appDb } = require('../config/supabase');

/**
 * Goal Analyzer Controller
 * Handles HTTP requests for financial goal analysis
 */
const goalAnalyzerController = {
  /**
   * GET /api/goals?userId=xxx - Get User's Goals
   * @param {String} req.query.userId - User ID
   */
  getUserGoals: async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required as query parameter'
        });
      }

      console.log('📋 Fetching goals for userId:', userId);

      const { data: goals, error } = await appDb
        .from('financialgoals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      console.log(`✅ Found ${goals?.length || 0} goals`);

      return res.status(200).json({
        success: true,
        message: `Found ${goals?.length || 0} goals`,
        data: goals || []
      });

    } catch (error) {
      console.error('❌ Get goals error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch goals',
        error: error.message
      });
    }
  },

  /**
   * POST /api/goals - Analyze and Save Financial Goal
   * @param {Object} req.body - { userId, title, description, targetAmount, targetDate, riskTolerance }
   */
  analyzeGoal: async (req, res) => {
    try {
      console.log('📊 Goal Analyzer - Request received:', req.body);
      const { userId, title, description, targetAmount, targetDate, riskTolerance, saveToDatabase } = req.body;

      // Validate required fields
      if (!userId || !targetAmount || !targetDate) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, targetAmount, targetDate are required',
          received: { userId, targetAmount, targetDate, riskTolerance }
        });
      }

      // Validate targetAmount is a positive number
      const amount = Number(targetAmount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'targetAmount must be a positive number'
        });
      }

      // Validate targetDate format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(targetDate)) {
        return res.status(400).json({
          success: false,
          message: 'targetDate must be in YYYY-MM-DD format',
          example: '2030-12-31'
        });
      }

      // Validate targetDate is in the future
      const targetDateObj = new Date(targetDate);
      const today = new Date();
      if (targetDateObj <= today) {
        return res.status(400).json({
          success: false,
          message: 'targetDate must be in the future'
        });
      }

      // Validate riskTolerance if provided
      const validRiskLevels = ['Low', 'Medium', 'High'];
      const risk = riskTolerance || 'Medium'; // Default to Medium
      if (!validRiskLevels.includes(risk)) {
        return res.status(400).json({
          success: false,
          message: 'riskTolerance must be one of: Low, Medium, High',
          received: riskTolerance
        });
      }

      // Analyze goal
      console.log('📊 Starting goal analysis...');
      const result = await goalAnalyzerService.analyzeGoalWithAI({
        userId,
        targetAmount: amount,
        targetDate,
        riskTolerance: risk
      });

      console.log('✅ Goal analysis completed');

      // Save to database if requested
      let savedGoal = null;
      if (saveToDatabase !== false) { // Default to true
        console.log('💾 Saving goal to database...');
        
        // Format AI recommendations for storage
        let aiRecommendations = '';
        if (result.goalAnalysis && result.goalAnalysis.riskBasedPlans) {
          const plan = result.goalAnalysis.riskBasedPlans[`${risk.toLowerCase()}RiskPlan`];
          if (plan) {
            aiRecommendations = `Required Monthly SIP: ${plan.actionPlan.requiredMonthlySIP}\n`;
            aiRecommendations += `Savings Shortfall/Surplus: ${plan.actionPlan.savingsShortfallOrSurplus}\n`;
            aiRecommendations += `\n${plan.actionPlan.analysisSummary}\n\n`;
            aiRecommendations += `Investment Strategy:\n`;
            plan.investmentStrategy.recommendedPortfolio.forEach(item => {
              aiRecommendations += `• ${item.category} (${item.allocationPercent}%): ${item.reasoning}\n`;
            });
          }
        }
        
        const goalData = {
          user_id: userId,
          title: title || `Goal: ₹${amount.toLocaleString('en-IN')}`,
          description: aiRecommendations || description || `Target: ₹${amount.toLocaleString('en-IN')} by ${targetDate}`,
          target_amount: amount,
          current_saved: 0,
          target_date: targetDate,
          status: 'active'
        };

        const { data: insertedGoal, error: insertError } = await appDb
          .from('financialgoals')
          .insert([goalData])
          .select()
          .single();

        if (insertError) {
          console.warn('⚠️ Failed to save goal to database:', insertError.message);
        } else {
          savedGoal = insertedGoal;
          console.log('✅ Goal saved with ID:', savedGoal.goal_id);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Goal analysis completed successfully',
        data: {
          ...result,
          savedGoal: savedGoal
        }
      });

    } catch (error) {
      console.error('❌ Goal Analyzer error:', error);
      console.error('Stack trace:', error.stack);
      return res.status(500).json({
        success: false,
        message: 'Failed to analyze goal',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  /**
   * PUT /api/goals/:goalId - Update Goal Progress
   * @param {String} req.params.goalId - Goal ID
   * @param {Object} req.body - { currentSaved, status }
   */
  updateGoal: async (req, res) => {
    try {
      const { goalId } = req.params;
      const { currentSaved, status } = req.body;

      console.log('📝 Updating goal:', goalId);

      const updateData = {};
      if (currentSaved !== undefined) updateData.current_saved = currentSaved;
      if (status) updateData.status = status;

      const { data: updatedGoal, error } = await appDb
        .from('financialgoals')
        .update(updateData)
        .eq('goal_id', goalId)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!updatedGoal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }

      console.log('✅ Goal updated');

      return res.status(200).json({
        success: true,
        message: 'Goal updated successfully',
        data: updatedGoal
      });

    } catch (error) {
      console.error('❌ Update goal error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update goal',
        error: error.message
      });
    }
  },

  /**
   * DELETE /api/goals/:goalId - Delete Goal
   * @param {String} req.params.goalId - Goal ID
   */
  deleteGoal: async (req, res) => {
    try {
      const { goalId } = req.params;

      console.log('🗑️ Deleting goal:', goalId);

      const { error } = await appDb
        .from('financialgoals')
        .delete()
        .eq('goal_id', goalId);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ Goal deleted');

      return res.status(200).json({
        success: true,
        message: 'Goal deleted successfully'
      });

    } catch (error) {
      console.error('❌ Delete goal error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete goal',
        error: error.message
      });
    }
  }
};

module.exports = goalAnalyzerController;
