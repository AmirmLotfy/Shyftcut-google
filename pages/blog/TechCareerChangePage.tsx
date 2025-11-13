import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '../../components/icons';
import Button from '../../components/Button';

const TechCareerChangePage: React.FC = () => {
    const post = {
        category: 'Career Advice',
        title: 'Your First Tech Career Change: A 5-Step Blueprint',
        imageUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e2775d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        author: 'The Shyftcut Team',
        date: 'October 28, 2023',
    };

    return (
        <div className="bg-white">
            <Header />
            <main className="pt-8 pb-16 lg:pt-16 lg:pb-24 bg-white antialiased">
                <div className="flex justify-between px-4 mx-auto max-w-screen-xl ">
                    <article className="mx-auto w-full max-w-3xl format format-sm sm:format-base lg:format-lg format-blue">
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
                                        <img className="mr-4 w-16 h-16 rounded-full" src="https://raw.githubusercontent.com/SalahHamza/Final-Project-for-gemini-2024/main/public/logo.png" alt={post.author} />
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
                                <img src={post.imageUrl} alt="People collaborating in a modern tech office." className="w-full rounded-2xl shadow-lg" />
                            </figure>

                            <div className="prose prose-lg max-w-none prose-slate mt-8">
                                <p className="lead">The tech industry is booming, and its allure is undeniable. But for those outside the bubble, breaking in can feel like trying to crack a secret code. The good news? It's more achievable than ever. A successful career change isn't about luck; it's about having a solid plan. Here is our 5-step blueprint to guide your transition.</p>
                                
                                <h2>Step 1: Research & Discovery</h2>
                                <p>Before you write a single line of code, you need a destination. "Tech" is not a monolith; it's a universe of diverse roles.</p>
                                <ul>
                                    <li><strong>Explore the Landscape:</strong> Look into different fields like Web Development (Front-End, Back-End), Data Science, UX/UI Design, Cybersecurity, and DevOps.</li>
                                    <li><strong>Assess Your Strengths:</strong> Are you a visual problem-solver? UX/UI might be a fit. Do you love logic and building things? Web Development could be for you. Are you fascinated by patterns in data? Explore Data Science.</li>
                                    <li><strong>Informational Interviews:</strong> Find people on LinkedIn who have the job you think you want. Politely ask for 15 minutes of their time to learn about their day-to-day. This is invaluable research.</li>
                                </ul>

                                <h2>Step 2: Skill Acquisition with a Plan</h2>
                                <p>Once you have a target role, it's time to build the skills. This is the most critical and time-consuming phase, where structure is your best friend.</p>
                                <ol>
                                    <li><strong>Find a Structured Curriculum:</strong> Don't just watch random YouTube videos. You need a path from A to Z. This is where AI-powered tools like Shyftcut excel, creating a personalized roadmap that structures your learning into logical, weekly milestones.</li>
                                    <li><strong>Focus on Fundamentals:</strong> Every field has its core principles. For developers, it's HTML, CSS, JavaScript. For data analysts, it's SQL and statistics. Master these before moving to advanced frameworks.</li>
                                    <li><strong>Be Consistent:</strong> Committing a few focused hours every week is far more effective than a 10-hour cramming session once a month.</li>
                                </ol>

                                <h2>Step 3: Build Your Portfolio</h2>
                                <p>A tech resume without a portfolio is just a piece of paper. You must prove you can do the work.</p>
                                <ul>
                                    <li><strong>Start Small:</strong> Your first project doesn't need to be the next Facebook. A simple calculator, a to-do list app, or a redesign of a local business's website are fantastic starting points.</li>
                                    <li><strong>Show Your Process:</strong> Don't just show the final product. Write a small case study or a README file explaining the problem you solved, the technologies you used, and what you learned. This demonstrates critical thinking.</li>
                                    <li><strong>Quality over Quantity:</strong> Two or three polished, well-documented projects are infinitely more valuable than ten half-finished ones.</li>
                                </ul>

                                <h2>Step 4: Network Strategically</h2>
                                <p>You've built the skills, now build the connections. Networking isn't about asking for a job; it's about building relationships.</p>
                                <ul>
                                    <li><strong>Engage Online:</strong> Be active on LinkedIn and Twitter. Follow industry leaders, comment thoughtfully on posts, and share what you're learning and building.</li>
                                    <li><strong>Attend Meetups:</strong> Whether virtual or in-person, local tech meetups are a great way to meet people and learn about the local job market.</li>
                                    <li><strong>Contribute:</strong> Find a small open-source project and contribute. Even fixing a typo in the documentation is a valid contribution that gets your name out there.</li>
                                </ul>

                                <h2>Step 5: The Job Hunt</h2>
                                <p>It's time to put it all together. Tailor your application materials for every single role.</p>
                                <ul>
                                    <li><strong>Rewrite Your Resume:</strong> Frame your past experience in terms of the skills required for the new role. A "customer service representative" becomes an "expert in user communication and problem resolution."</li>
                                    <li><strong>Prepare for Tech Interviews:</strong> Practice common interview questions for your field. For developers, this means algorithm challenges on sites like LeetCode. For designers, it means being ready to walk through your portfolio.</li>
                                    <li><strong>Be Persistent:</strong> You will face rejection. It's part of the process. Every "no" is a learning opportunity that gets you closer to a "yes."</li>
                                </ul>

                                <p>A career change into tech is a marathon. It requires dedication and a clear plan. By following this blueprint, you can systematically build the skills, portfolio, and network you need to make a successful transition.</p>
                                <Button size="lg" onClick={() => (window.location.href = '#/app/wizard')} className="mt-4">Plan Your Career Change</Button>
                            </div>
                        </motion.div>
                    </article>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default TechCareerChangePage;
