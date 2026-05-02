import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAiChat, clearAiChatError, sendAiMessage } from '../../redux/slices/aiChatSlice';
import AiProductCard from '../AI/AiProductCard';

const QUICK_PROMPTS = ['Show women top wear under 5000', 'Find branded hoodies', 'Is Ajax sweatshirt available?'];

const FloatingAiAssistant = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const { messages, loading, error } = useSelector((state: any) => state.aiChat);

  const canSubmit = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, loading, isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!input.trim()) {
      return;
    }

    dispatch(clearAiChatError());
    const trimmed = input.trim();
    setInput('');
    await dispatch(sendAiMessage(trimmed) as any);
  };

  const handleQuickPrompt = async (prompt: string) => {
    dispatch(clearAiChatError());
    setInput('');
    await dispatch(sendAiMessage(prompt) as any);
  };

  return (
    <>
      {isOpen && (
        <div className='fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px]' onClick={() => setIsOpen(false)} aria-hidden='true' />
      )}

      <section className='pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end'>
        {isOpen && (
          <div className='pointer-events-auto mb-2 flex h-[600px] max-h-[calc(100vh-120px)] w-[min(94vw,420px)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)]'>
            <div className='flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 px-5 py-4 text-white'>
              <div>
                <h3 className='text-base font-semibold'>AI Shopping Assistant</h3>
                <p className='text-xs text-slate-200'>Online now • Ask for products, pricing, size, and availability</p>
              </div>
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                className='rounded-md px-2 py-1 text-xs font-medium hover:bg-white/15'
              >
                Close
              </button>
            </div>

            <div className='border-b border-slate-100 bg-slate-50/60 px-5 py-3'>
              <p className='mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500'>Quick prompts</p>
              <div className='flex flex-wrap gap-1.5'>
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type='button'
                    onClick={() => handleQuickPrompt(prompt)}
                    disabled={loading}
                    className='rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] text-slate-700 hover:bg-slate-100 disabled:opacity-60'
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className='flex-1 overflow-y-auto bg-slate-50 px-5 py-4'>
              {messages.length === 0 ? (
                <div className='rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600'>
                  Try asking: "Show women top wear under 3000"
                </div>
              ) : (
                <div className='space-y-3'>
                  {messages.map((message: any) => (
                    <div key={message.timestamp} className='space-y-2'>
                      {/* User message or assistant text (hide text if products exist) */}
                      {!(message.role === 'assistant' && message.products && message.products.length > 0) && (
                        <div
                          className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            message.role === 'user'
                              ? 'ml-auto bg-slate-900 text-white shadow-sm'
                              : 'bg-white text-slate-800 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.35)]'
                          }`}
                        >
                          {message.content}
                        </div>
                      )}

                      {/* Product cards for assistant responses with products */}
                      {message.role === 'assistant' && message.products && message.products.length > 0 && (
                        <div className='max-w-[88%] mr-auto'>
                          <div className='flex gap-3 overflow-x-auto py-2 -mx-4 px-4'>
                            {message.products.slice(0, 5).map((product: any) => (
                              <div key={product.id} className='flex-none w-56'>
                                <AiProductCard
                                  id={product.id}
                                  name={product.name}
                                  price={product.price}
                                  brand={product.brand}
                                  category={product.category}
                                  countInStock={product.countInStock}
                                  image={product.image}
                                    onViewProduct={() => setIsOpen(false)}
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
              
              <div ref={chatEndRef} />
            </div>

            <div className='border-t border-slate-200 bg-white px-5 py-4'>
              <form onSubmit={handleSubmit} className='flex gap-2'>
                <input
                  type='text'
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder='Ask anything about products...'
                  className='flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none'
                />
                <button
                  type='submit'
                  disabled={!canSubmit}
                  className='rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60'
                >
                  Send
                </button>
              </form>

              <div className='mt-2 flex items-center justify-between'>
                {error ? <p className='text-[11px] text-red-600'>{error}</p> : <span className='text-[11px] text-slate-500'>Powered by AI</span>}
                <div className='flex gap-3'>
                  <button
                    type='button'
                    onClick={() => dispatch(clearAiChat())}
                    className='text-[11px] text-slate-600 hover:text-black'
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          type='button'
          onClick={() => setIsOpen((prev) => !prev)}
          className='pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-xl text-white shadow-xl transition hover:scale-105 hover:bg-slate-800'
          aria-label='Open AI assistant'
        >
          ✦
        </button>
      </section>
    </>
  );
};

export default FloatingAiAssistant;