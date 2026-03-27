import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance.js';

const SYSTEM_PROMPT = `You are FoodRush AI, a friendly and enthusiastic food delivery assistant.
You help users with:
1. Food recommendations based on mood, preferences, or occasion
2. Restaurant suggestions based on cuisine, rating, price range, and location
3. Best coupons: FIRST50 (50% off first order), SAVE20 (20% off above ₹299), FREEDEL (free delivery)
4. Order tracking FAQs and general help
5. Dietary advice (veg/non-veg, calories, allergies)

Always be warm, concise, and use food emojis 🍕🍔🌮🍜. 
When recommending restaurants, suggest 2-3 options with ratings.
If asked about order status, politely ask for their order number.
Keep responses under 150 words unless detailed info is needed.`;

export const sendChatMessage = createAsyncThunk(
  'chatbot/sendMessage',
  async (userMessage, { getState, rejectWithValue }) => {
    try {
      const { messages } = getState().chatbot;
      const history = messages.slice(-10).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

      const isMock = import.meta.env.VITE_OPENAI_MOCK === 'true';
      if (isMock) {
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));
        return getMockResponse(userMessage);
      }

      // axios handles JSON parsing automatically — no response.ok or response.json() needed
      const response = await axiosInstance.post('/api/v1/chatbot/message', {
        system: SYSTEM_PROMPT,
        messages: [...history, { role: 'user', content: userMessage }],
      });

      return response.data.choices[0].message.content;

    } catch (err) {
      console.error('Chatbot error:', err?.response?.data || err.message);
      return rejectWithValue("I'm having a small hiccup 🙈 Please try again in a moment!");
    }
  }
);

function getMockResponse(message) {
  const msg = message.toLowerCase();
  if (msg.includes('recommend') || msg.includes('suggest') || msg.includes('what should')) {
    return "Great choice asking me! 😄 Based on popular orders, I'd suggest:\n\n🍕 **Pizza Palace** (4.5⭐) - Amazing wood-fired pizzas\n🍔 **Burger Barn** (4.3⭐) - Juicy gourmet burgers\n🌮 **Taco Town** (4.4⭐) - Authentic Mexican flavors\n\nAll deliver in 25-35 min. Which cuisine are you in the mood for?";
  }
  if (msg.includes('coupon') || msg.includes('discount') || msg.includes('offer')) {
    return "🎉 Great news! Here are today's best coupons:\n\n🏷️ **FIRST50** - 50% off your first order (up to ₹100)\n🏷️ **SAVE20** - 20% off on orders above ₹299\n🏷️ **FREEDEL** - Free delivery on any order\n\nUse them at checkout. Which one works best for you?";
  }
  if (msg.includes('veg') || msg.includes('vegetarian')) {
    return "🥗 Looking for veg options? Here are top-rated veg-friendly restaurants:\n\n🌿 **Green Bowl** (4.6⭐) - 100% veg, amazing salads & wraps\n🍛 **Spice Garden** (4.4⭐) - North Indian veg delights\n🧆 **Falafel House** (4.5⭐) - Middle Eastern veg specialties\n\nAll have a wide veg menu. Want me to filter by cuisine?";
  }
  if (msg.includes('track') || msg.includes('order status') || msg.includes('where is')) {
    return "📦 I'd love to help you track your order! You can:\n\n1. Go to **My Orders** in the menu\n2. Click on your active order\n3. See real-time status updates\n\nOr share your order number (e.g., FR-20240101-00001) and I'll look it up for you! 🔍";
  }
  if (msg.includes('fast') || msg.includes('quick') || msg.includes('30 min')) {
    return "⚡ Need food fast? These restaurants have the quickest delivery times:\n\n🚀 **QuickBites** - 15-20 min avg delivery\n🚀 **Speed Kitchen** - 20-25 min avg delivery\n🚀 **Express Eats** - 25-30 min avg delivery\n\nTip: Use **FREEDEL** for free delivery on any quick order! 🎁";
  }
  return "I'm here to help with food recommendations, restaurant suggestions, coupons, and order questions! 🍽️\n\nTry asking me:\n- \"What's good for dinner tonight?\"\n- \"Any coupons available?\"\n- \"Best rated restaurants near me?\"\n- \"Track my order\"";
}

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState: {
    isOpen: false,
    messages: [],
    isTyping: false,
    error: null,
  },
  reducers: {
    toggleChatbot: (state) => { state.isOpen = !state.isOpen; },
    openChatbot:   (state) => { state.isOpen = true; },
    closeChatbot:  (state) => { state.isOpen = false; },
    clearChat:     (state) => { state.messages = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state, { meta }) => {
        state.messages.push({
          role: 'user',
          content: meta.arg,
          timestamp: new Date().toISOString(),
        });
        state.isTyping = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, { payload }) => {
        state.isTyping = false;
        state.messages.push({
          role: 'assistant',
          content: payload,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(sendChatMessage.rejected, (state, { payload }) => {
        state.isTyping = false;
        state.messages.push({
          role: 'assistant',
          content: payload,
          timestamp: new Date().toISOString(),
          isError: true,
        });
      });
  },
});

export const selectChatOpen     = (state) => state.chatbot.isOpen;
export const selectChatMessages = (state) => state.chatbot.messages;
export const selectChatTyping   = (state) => state.chatbot.isTyping;

export const { toggleChatbot, openChatbot, closeChatbot, clearChat } = chatbotSlice.actions;
export default chatbotSlice.reducer;