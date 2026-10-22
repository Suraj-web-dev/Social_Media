import {
  generateCaptionsAndHashtags,
  chatWithPingAI,
  generateSmartReplies,
} from '../services/ai.service.js';

/**
 * Controller: Generate AI Captions & Hashtags
 * Route: POST /api/ai/caption
 */
export const generateCaption = async (req, res) => {
  try {
    const { prompt, mood } = req.body;
    let imageBuffer = null;
    let imageMime = null;

    if (req.file) {
      imageBuffer = req.file.buffer;
      imageMime = req.file.mimetype;
    }

    const data = await generateCaptionsAndHashtags({
      prompt: prompt || '',
      mood: mood || 'Aesthetic',
      imageBuffer,
      imageMime,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in generateCaption:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate captions and hashtags',
    });
  }
};

/**
 * Controller: Chat with PingAI
 * Route: POST /api/ai/chat
 */
export const chatWithPingAIHandler = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const userName = req.user?.full_name || req.user?.username || 'friend';

    const result = await chatWithPingAI({
      message: message.trim(),
      history: history || [],
      userName,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in chatWithPingAI:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get response from PingAI',
    });
  }
};

/**
 * Controller: Generate 1-Tap AI Smart Replies
 * Route: POST /api/ai/smart-replies
 */
export const getSmartReplies = async (req, res) => {
  try {
    const { context, type } = req.body;

    if (!context || !context.trim()) {
      return res.status(200).json({
        success: true,
        data: type === 'comment'
          ? ['Love this! 😍', 'So inspiring ✨', 'Total perfection! 🔥']
          : ['Sounds good! 👍', 'On my way! 🚀', 'Talk soon! 😊'],
      });
    }

    const replies = await generateSmartReplies({
      context: context.trim(),
      type: type || 'comment',
    });

    return res.status(200).json({
      success: true,
      data: replies,
    });
  } catch (error) {
    console.error('Error in getSmartReplies:', error);
    return res.status(200).json({
      success: true,
      data: req.body?.type === 'comment'
        ? ['Love this! 😍', 'So inspiring ✨', 'Total perfection! 🔥']
        : ['Sounds good! 👍', 'On it! 🚀', 'Talk soon! 😊'],
    });
  }
};
