import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAiChat, clearAiChatError, sendAiMessage } from '../../redux/slices/aiChatSlice';
import AiProductCard from '../AI/AiProductCard';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_PROMPTS = ['Show women top wear under 5000', 'Find branded hoodies', 'Is Ajax sweatshirt available?'];

/* ─── Typing indicator (3 bouncing dots) ─── */
const TypingDots = () => (
  <div className='flex items-center gap-1 px-4 py-3'>
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className='inline-block h-2 w-2 rounded-full bg-indigo-400'
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

/* ─── Animation Variants ─── */
const panelVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 28 } },
  exit: { opacity: 0, scale: 0.92, y: 24, transition: { duration: 0.2, ease: 'easeIn' } },
};

const messageVariants = {
  hidden: (isUser: boolean) => ({ opacity: 0, x: isUser ? 20 : -20 }),
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
};

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
      {/* Backdrop overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]'
            onClick={() => setIsOpen(false)}
            aria-hidden='true'
          />
        )}
      </AnimatePresence>

      <section className='pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end'>
        {/* ─── Chat Panel ─── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={panelVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              className='pointer-events-auto mb-3 flex h-[620px] max-h-[calc(100vh-120px)] w-[min(94vw,420px)] flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-[0_32px_80px_-20px_rgba(79,70,229,0.35)] backdrop-blur-xl'
              style={{ transformOrigin: 'bottom right' }}
            >
              {/* ─── Header ─── */}
              <div className='relative flex items-center justify-between overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-5 py-4 text-white'>
                {/* Decorative blur circles */}
                <div className='pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl' />
                <div className='pointer-events-none absolute -left-4 bottom-0 h-16 w-16 rounded-full bg-white/10 blur-xl' />

                <div className='relative z-10 flex items-center gap-3'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-lg backdrop-blur-sm'>
                    ✦
                  </div>
                  <div>
                    <h3 className='text-[15px] font-bold tracking-tight'>AI Shopping Assistant</h3>
                    <div className='flex items-center gap-1.5'>
                      <span className='relative flex h-2 w-2'>
                        <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
                        <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-400' />
                      </span>
                      <p className='text-[11px] font-medium text-indigo-100'>Online • Products, pricing & availability</p>
                    </div>
                  </div>
                </div>

                <button
                  type='button'
                  onClick={() => setIsOpen(false)}
                  className='relative z-10 rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white'
                  aria-label='Close assistant'
                >
                  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                    <line x1='18' y1='6' x2='6' y2='18' />
                    <line x1='6' y1='6' x2='18' y2='18' />
                  </svg>
                </button>
              </div>

              {/* ─── Quick Prompts ─── */}
              <div className='border-b border-gray-100 bg-gradient-to-b from-indigo-50/80 to-white px-5 py-3'>
                <p className='mb-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-400'>
                  <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2' />
                  </svg>
                  Quick prompts
                </p>
                <div className='flex flex-wrap gap-1.5'>
                  {QUICK_PROMPTS.map((prompt, index) => (
                    <motion.button
                      key={prompt}
                      type='button'
                      onClick={() => handleQuickPrompt(prompt)}
                      disabled={loading}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className='rounded-full border border-indigo-200/60 bg-white px-3 py-1.5 text-[11px] font-medium text-indigo-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md disabled:opacity-50'
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* ─── Messages ─── */}
              <div className='flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white px-5 py-4'>
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='mt-8 flex flex-col items-center text-center'
                  >
                    <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-3xl'>
                      ✦
                    </div>
                    <p className='text-sm font-semibold text-gray-800'>How can I help you today?</p>
                    <p className='mt-1 text-xs text-gray-500'>Try asking: "Show women top wear under 3000"</p>
                  </motion.div>
                ) : (
                  <div className='space-y-3'>
                    {messages.map((message: any) => (
                      <div key={message.timestamp} className='space-y-2'>
                        {/* Typing placeholder */}
                        {message.role === 'assistant' && message.isPlaceholder ? (
                          <motion.div
                            custom={false}
                            variants={messageVariants}
                            initial='hidden'
                            animate='visible'
                            className='max-w-[85%] rounded-2xl rounded-bl-md bg-white shadow-[0_4px_20px_-8px_rgba(0,0,0,0.12)] ring-1 ring-gray-100'
                          >
                            <TypingDots />
                          </motion.div>
                        ) : (
                          <>
                            {/* Text messages (hide text if products exist) */}
                            {!(message.role === 'assistant' && message.products && message.products.length > 0) && (
                              <motion.div
                                custom={message.role === 'user'}
                                variants={messageVariants}
                                initial='hidden'
                                animate='visible'
                                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                                  message.role === 'user'
                                    ? 'ml-auto rounded-br-md bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-500/20'
                                    : 'rounded-bl-md bg-white text-gray-700 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.12)] ring-1 ring-gray-100'
                                }`}
                              >
                                {message.content}
                              </motion.div>
                            )}

                            {/* Product cards */}
                            {message.role === 'assistant' && message.products && message.products.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className='max-w-[92%] mr-auto'
                              >
                                <div className='flex gap-3 overflow-x-auto py-2 -mx-2 px-2 scrollbar-thin'>
                                  {message.products.slice(0, 5).map((product: any) => (
                                    <div key={product.id} className='flex-none w-52'>
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
                              </motion.div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* ─── Input Bar ─── */}
              <div className='border-t border-gray-100 bg-white/90 px-4 py-3 backdrop-blur-sm'>
                <form onSubmit={handleSubmit} className='flex gap-2'>
                  <input
                    type='text'
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder='Ask anything about products...'
                    className='flex-1 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 text-sm text-gray-700 transition-all placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20'
                  />
                  <motion.button
                    type='submit'
                    disabled={!canSubmit}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className='flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 disabled:opacity-50 disabled:shadow-none'
                  >
                    <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                      <line x1='22' y1='2' x2='11' y2='13' />
                      <polygon points='22 2 15 22 11 13 2 9 22 2' />
                    </svg>
                  </motion.button>
                </form>

                <div className='mt-2 flex items-center justify-between px-1'>
                  {error ? (
                    <p className='text-[11px] font-medium text-red-500'>{error}</p>
                  ) : (
                    <span className='flex items-center gap-1 text-[11px] text-gray-400'>
                      <svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='currentColor'>
                        <path d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z' />
                      </svg>
                      Powered by AI
                    </span>
                  )}
                  <button
                    type='button'
                    onClick={() => dispatch(clearAiChat())}
                    className='rounded-md px-2 py-0.5 text-[11px] font-medium text-gray-400 transition hover:bg-gray-100 hover:text-gray-600'
                  >
                    Clear chat
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Floating Action Button ─── */}
        <motion.button
          type='button'
          onClick={() => setIsOpen((prev) => !prev)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          className='pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30 transition-shadow hover:shadow-2xl hover:shadow-indigo-500/40'
          aria-label='Open AI assistant'
        >
          {/* Animated ring */}
          <span className='absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 opacity-0 blur-md transition-opacity hover:opacity-60' />
          <span className='relative text-xl font-bold'>✦</span>
        </motion.button>
      </section>
    </>
  );
};

export default FloatingAiAssistant;