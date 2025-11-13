
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { allPosts, ContentPart } from '../constants/blogPosts';
import { ArrowLeftIcon } from '../components/icons';
import NotFoundPage from './NotFoundPage';
import Button from '../components/Button';

// A component to safely render HTML within strings
const ParsedText: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(<strong>.*?<\/strong>|<code>.*?<\/code>)/g);
    return (
        <>
            {parts.map((part, index) => {
                if (part.startsWith('<strong>')) {
                    return <strong key={index}>{part.slice(8, -9)}</strong>;
                }
                if (part.startsWith('<code>')) {
                    return <code key={index} className="bg-slate-800 text-secondary-400 font-mono py-0.5 px-1.5 rounded-md text-sm">{part.slice(6, -7)}</code>;
                }
                return part;
            })}
        </>
    );
};

const ContentRenderer: React.FC<{ content: ContentPart[] }> = ({ content }) => {
    const navigate = useNavigate();
    return (
        <div className="prose prose-lg max-w-none prose-slate prose-invert mt-8">
            {content.map((part, index) => {
                switch (part.type) {
                    case 'lead':
                        return <p key={index} className="lead"><ParsedText text={part.text} /></p>;
                    case 'heading':
                        // Fix: Replaced dynamic tag name creation with explicit `h2` and `h3` rendering
                        // to resolve JSX namespace and signature errors. The `ContentPart` type for
                        // 'heading' restricts `level` to 2 or 3.
                        if (part.level === 2) {
                            return <h2 key={index}><ParsedText text={part.text} /></h2>;
                        }
                        return <h3 key={index}><ParsedText text={part.text} /></h3>;
                    case 'paragraph':
                        return <p key={index}><ParsedText text={part.text} /></p>;
                    case 'list':
                        return (
                            <ul key={index}>
                                {part.items.map((item, i) => <li key={i}><ParsedText text={item} /></li>)}
                            </ul>
                        );
                    case 'button':
                        return <Button size="lg" onClick={() => navigate(part.href)} className="mt-4 no-underline">{part.text}</Button>
                    default:
                        return null;
                }
            })}
        </div>
    );
};


const BlogPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const post = allPosts.find(p => p.slug === slug);

    if (!post) {
        return <NotFoundPage />;
    }

    return (
        <div className="bg-slate-900">
            <Header />
            <main className="pt-8 pb-16 lg:pt-16 lg:pb-24 bg-slate-900 antialiased">
                <div className="flex justify-between px-4 mx-auto max-w-screen-xl ">
                    <article className="mx-auto w-full max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        >
                            <div className="mb-4">
                                <Link to="/blog" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-primary transition-colors">
                                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                    All Posts
                                </Link>
                            </div>
                            <header className="mb-4 lg:mb-6 not-format">
                                <address className="flex items-center mb-6 not-italic">
                                    <div className="inline-flex items-center mr-3 text-sm text-slate-100">
                                        <div className="mr-4 w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center font-bold text-primary text-xl">
                                            {post.author.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <span className="text-xl font-bold text-slate-100">{post.author}</span>
                                            <p className="text-base text-slate-400">{post.date}</p>
                                        </div>
                                    </div>
                                </address>
                                <p className="text-base font-semibold leading-7 text-primary">{post.category}</p>
                                <h1 className="mb-4 text-3xl font-extrabold leading-tight text-slate-50 lg:mb-6 lg:text-5xl">{post.title}</h1>
                            </header>
                            
                            <figure>
                                <img src={post.imageUrl} alt={`Featured image for ${post.title}`} className="w-full rounded-2xl shadow-lg" />
                            </figure>

                            <ContentRenderer content={post.content} />

                        </motion.div>
                    </article>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default BlogPostPage;
