import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '../../components/icons';
import Button from '../../components/Button';

const AIInYourCareerPage: React.FC = () => {
    const post = {
        category: 'Future of Work',
        title: 'AI is Not Just for Engineers: 5 Ways to Use AI in Your Career Today',
        imageUrl: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=1470&q=80',
        author: 'The Shyftcut Team',
        date: 'November 02, 2023',
    };

    return (
        <div className="bg-white">
            <Header />
            <main className="pt-8 pb-16 lg:pt-16 lg:pb-24 bg-white antialiased">
                <div className="flex justify-between px-4 mx-auto max-w-screen-xl ">
                    <article className="mx-auto w-full max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        >
                            <div className="mb-4">
                                <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors">
                                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                    Back to Home
                                </Link>
                            </div>
                            <header className="mb-4 lg:mb-6 not-format">
                                <address className="flex items-center mb-6 not-italic">
                                    <div className="inline-flex items-center mr-3 text-sm text-gray-900">
                                        <img className="mr-4 w-16 h-16 rounded-full" src="https://images.unsplash.com/photo-1634746709990-23f9a72a583d?auto=format&fit=crop&w=100&q=80" alt={post.author} />
                                        <div>
                                            <a href="#" rel="author" className="text-xl font-bold text-gray-900">{post.author}</a>
                                            <p className="text-base text-gray-500">{post.date}</p>
                                        </div>
                                    </div>
                                </address>
                                <p className="text-base font-semibold leading-7 text-primary">{post.category}</p>
                                <h1 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 lg:mb-6 lg:text-5xl">{post.title}</h1>
                            </header>
                            
                            <figure>
                                <img src={post.imageUrl} alt="Abstract representation of an AI neural network." className="w-full rounded-2xl shadow-lg" />
                            </figure>

                            <div className="prose prose-lg max-w-none prose-slate mt-8">
                                <p className="lead">When you hear "Artificial Intelligence," you might picture complex code, robotics, or data centers humming away. While AI engineers are in high demand, the AI revolution isn't confined to the server room. It's a powerful tool that, when understood, can amplify the skills of professionals in almost any field. Here are five practical ways you can start leveraging AI in your career today, no engineering degree required.</p>
                                
                                <h3>1. The Marketer: Your New Creative Partner</h3>
                                <p>AI is transforming how brands connect with audiences. Instead of replacing marketers, it's giving them superpowers.</p>
                                <ul>
                                    <li><strong>Content Ideation:</strong> Stuck for blog ideas? Ask an AI like Gemini or ChatGPT to "act as a content strategist and generate 10 blog titles for a sustainable fashion brand targeting Gen Z."</li>
                                    <li><strong>Copywriting Assistance:</strong> Use AI to draft ad copy, social media posts, or email subject lines. The key is to treat the output as a first draft, then use your human expertise to refine the tone and message.</li>
                                    <li><strong>SEO Analysis:</strong> Tools like SurferSEO use AI to analyze top-ranking pages and provide data-driven suggestions to improve your content's search performance.</li>
                                </ul>

                                <h3>2. The Designer: An Infinite Mood Board</h3>
                                <p>Generative AI has exploded in the design world, not as a replacement for creativity, but as a powerful tool for ideation and execution.</p>
                                <ul>
                                    <li><strong>Rapid Prototyping:</strong> Need a logo concept or a website mockup fast? Tools like Midjourney or DALL-E can generate dozens of visual ideas in minutes based on a text prompt (e.g., "a minimalist logo for a coffee shop, using earthy tones and a leaf motif").</li>
                                    <li><strong>Image Editing:</strong> Adobe Photoshop's Generative Fill allows you to seamlessly add, remove, or expand elements in an image with simple text commands, saving hours of manual work.</li>
                                    <li><strong>Presentation Design:</strong> Tools like Gamma or Tome can create entire, beautifully designed slide decks from a simple document or prompt, letting you focus on the content, not the formatting.</li>
                                </ul>

                                <h3>3. The Project Manager: The Ultimate Assistant</h3>
                                <p>AI is a game-changer for organization and efficiency, helping managers see around corners and automate tedious tasks.</p>
                                <ul>
                                    <li><strong>Automated Summaries:</strong> Feed a long meeting transcript into an AI model and ask for a summary with key decisions and action items.</li>
                                    <li><strong>Risk Prediction:</strong> Modern project management software uses AI to analyze project data and flag potential delays or budget overruns before they become critical.</li>
                                    <li><strong>Task Automation:</strong> Use no-code tools like Zapier, which increasingly integrate AI, to automate workflows, like creating a task in Asana whenever a specific type of email arrives in Gmail.</li>
                                </ul>
                                
                                <h3>4. The Sales Professional: Personalization at Scale</h3>
                                <p>AI helps sales teams build better relationships by handling the data-heavy lifting, freeing them up to focus on the human connection.</p>
                                <ul>
                                    {/* FIX: The placeholder {first_name} was being interpreted as a variable. It has been wrapped in a string literal and a <code> tag to be displayed correctly. */}
                                    <li><strong>Email Personalization:</strong> AI tools can analyze a prospect's LinkedIn profile and company website to help you draft highly personalized outreach emails that go far beyond "Hi <code>{'{first_name}'}</code>."</li>
                                    <li><strong>Lead Scoring:</strong> AI can analyze customer data to predict which leads are most likely to convert, helping you prioritize your time and effort effectively.</li>
                                    <li><strong>Conversation Intelligence:</strong> Tools like Gong.io use AI to analyze sales calls, providing feedback on your talk-to-listen ratio, keywords used, and overall effectiveness.</li>
                                </ul>

                                <h3>5. The Writer/Creator: Overcoming the Blank Page</h3>
                                <p>Whether you're a novelist, a blogger, or a business writer, AI can be an invaluable partner in the creative process.</p>
                                <ul>
                                    <li><strong>Research Synthesis:</strong> Instead of reading ten articles, you can ask an AI to summarize the key findings on a topic, providing you with a high-level overview in seconds.</li>
                                    <li><strong>Brainstorming Outlines:</strong> If you have a topic but don't know how to structure it, ask an AI to "create a detailed outline for an article about the benefits of remote work."</li>
                                    <li><strong>Advanced Proofreading:</strong> Tools like Grammarly use AI not just for spell-checking, but to analyze tone, clarity, and style, offering suggestions to make your writing more impactful.</li>
                                </ul>
                                
                                <h2>Conclusion: Your Future is AI-Assisted</h2>
                                <p>The future of work isn't about humans versus machines; it's about humans with machines. Developing AI literacy—understanding what these tools can do and how to prompt them effectively—is becoming a critical skill for every professional. You don't need to be an engineer to use AI, but you do need to be curious and willing to learn.</p>
                                <Button size="lg" onClick={() => (window.location.href = '#/app/wizard?track=Artificial%20Intelligence')} className="mt-4">Learn About AI</Button>
                            </div>
                        </motion.div>
                    </article>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AIInYourCareerPage;