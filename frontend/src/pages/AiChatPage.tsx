import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAiChat, clearAiChatError, sendAiMessage } from '../redux/slices/aiChatSlice';
import AiProductCard from '../components/AI/AiProductCard';

const QUICK_PROMPTS = [
  'Is iPhone 13 available?',
  'Show me shoes under 3000',
  'Do you have Samsung phones?',
  'What is the weather today?',
];

const AiChatPage = () => {
  const [input, setInput] = useState('');
  const dispatch = useDispatch();
  const { messages, loading, error } = useSelector((state) => state.aiChat);

  const canSubmit = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  /**
   * Steps:
   *   1. Prevent default form reload behavior.
   *   2. Validate non-empty message and clear stale errors.
   *   3. Dispatch sendAiMessage and reset input field.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!input.trim()) {
      return;
    }

    dispatch(clearAiChatError());
    // Clear input immediately for better UX and optimistic display
    const trimmed = input.trim();
    setInput('');
    await dispatch(sendAiMessage(trimmed));
  };

  /**
   * Function: handleQuickPrompt
   * Sends a predefined test prompt to quickly validate AI chat behavior.
   * Steps:
   *   1. Clear stale errors.
   *   2. Dispatch sendAiMessage with selected prompt.
   */
  const handleQuickPrompt = async (prompt) => {
    dispatch(clearAiChatError());
    setInput('');
    await dispatch(sendAiMessage(prompt));
  };

  return (
    <section className='container mx-auto px-4 py-10'>
      <div className='mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-sm'>
        <div className='flex items-center justify-between border-b border-gray-200 px-5 py-4'>
          <div>
            <h1 className='text-lg font-semibold text-gray-900'>AI Shopping Assistant</h1>
            <p className='text-sm text-gray-500'>Ask product availability or filtered product search queries.</p>
          </div>
          <button
            type='button'
            onClick={() => dispatch(clearAiChat())}
            className='rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50'
          >
            Clear Chat
          </button>
        </div>

        <div className='border-b border-gray-200 px-5 py-3'>
          <p className='mb-2 text-xs font-medium uppercase tracking-wide text-gray-500'>Quick Tests</p>
          <div className='flex flex-wrap gap-2'>
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type='button'
                onClick={() => handleQuickPrompt(prompt)}
                disabled={loading}
                className='rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className='h-[420px] overflow-y-auto px-5 py-4'>
          {messages.length === 0 ? (
            <div className='rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600'>
              Try: Is iPhone 13 available? or Show me shoes under 3000.
            </div>
          ) : (
            <div className='space-y-3'>
              {messages.map((message) => (
                <div key={message.timestamp} className='space-y-2'>
                  {/* User message or assistant text (hide text if products exist) */}
                  {!(message.role === 'assistant' && message.products && message.products.length > 0) && (
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                        message.role === 'user' ? 'ml-auto bg-black text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                  )}

                  {/* Product cards for assistant responses with products */}
                  {message.role === 'assistant' && message.products && message.products.length > 0 && (
                    <div className='max-w-[85%] mr-auto'>
                      <div className='flex gap-3 overflow-x-auto py-2 -mx-4 px-4'>
                        {message.products.map((product) => (
                          <div key={product.id} className='flex-none w-64'>
                            <AiProductCard
                              id={product.id}
                              name={product.name}
                              price={product.price}
                              brand={product.brand}
                              category={product.category}
                              countInStock={product.countInStock}
                              image={product.image}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
        </div>

        <div className='border-t border-gray-200 px-5 py-4'>
          <form onSubmit={handleSubmit} className='flex gap-2'>
            <input
              type='text'
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder='Ask about availability, brand, category, or max price...'
              className='flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none ring-0 focus:border-gray-500'
            />
            <button
              type='submit'
              disabled={!canSubmit}
              className='rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60'
            >
              Send
            </button>
          </form>
          {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
        </div>
      </div>
    </section>
  );
};

export default AiChatPage;
