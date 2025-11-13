
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { allPosts } from '../constants/blogPosts';

const BlogIndexPage: React.FC = () => {
    return (
        <div className="min-h-screen gradient-primary">
            <Header />
            <main className="py-24 sm:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                            The Shyftcut Blog
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-slate-600">
                            Insights, tutorials, and career advice from our team and industry experts to accelerate your learning journey.
                        </p>
                    </motion.div>

                    <div className="mt-20 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                        {allPosts.map((post, index) => (
                            <motion.div
                                key={post.slug}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Link to={`/blog/${post.slug}`} className="block group">
                                    <motion.div 
                                        className="glass-card overflow-hidden h-full flex flex-col"
                                        whileHover={{ y: -8 }}
                                    >
                                        <img className="h-48 w-full object-cover" src={post.imageUrl} alt={`Featured image for ${post.title}`} />
                                        <div className="p-6 flex flex-col flex-grow">
                                            <p className="text-sm font-bold text-primary uppercase tracking-wider">{post.category}</p>
                                            <h3 className="mt-2 text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{post.title}</h3>
                                            <p className="mt-3 text-base text-slate-600 line-clamp-3 flex-grow leading-relaxed">{post.excerpt}</p>
                                            <div className="mt-4 text-sm font-semibold text-primary group-hover:underline">Read more &rarr;</div>
                                        </div>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default BlogIndexPage;
