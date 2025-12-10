import { Article, Comment, ArticleFormData } from './types';

const STORAGE_KEYS = {
  ARTICLES: 'ocean_journal_articles',
  COMMENTS: 'ocean_journal_comments',
  USER_ID: 'ocean_journal_user_id',
  IS_ADMIN: 'ocean_journal_is_admin',
};

// ==========================================
// TO PUBLISH: PASTE YOUR EXPORTED DATA BELOW
// ==========================================
// This application uses localStorage for demonstration purposes.
// Articles are not saved to a database and cannot be shared.
const SEED_ARTICLES: Article[] = [
    {
      id: "sample_1",
      title: "The Art of Ocean Minimalism",
      excerpt: "Why the sea teaches us to let go of the unnecessary and find peace in the vastness.",
      content: "The ocean is the ultimate minimalist.\n\nIt doesn't hoard. It washes away footprints on the sand with every tide. It accepts the rain and reflects the sky without judgment. In our digital lives, we tend to accumulate—files, notifications, worries. But standing by the shore, looking at the horizon, we realize how little we actually need.\n\nMinimalism isn't just about having fewer things; it's about making room for more of what matters. Like the ocean makes room for the whales, the reefs, and the light.",
      coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
      tags: ["minimalism", "philosophy"],
      status: "published",
      likes: 42,
      likedBy: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: "sample_2",
      title: "Coding with the Tide",
      excerpt: "How natural rhythms can improve your programming flow state.",
      content: "There is a rhythm to good code, just like the tide coming in and out.\n\nPush and pull. Request and response. Try and catch.\n\nWhen we fight against the current—forcing logic where it doesn't fit, working through exhaustion—we crash. But when we learn to surf the waves of our own creativity, coding becomes less like engineering and more like art.",
      coverImage: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&auto=format&fit=crop",
      tags: ["coding", "productivity"],
      status: "published",
      likes: 128,
      likedBy: [],
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000
    }
];

// User Identification
export const getUserId = (): string => {
  let uid = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(STORAGE_KEYS.USER_ID, uid);
  }
  return uid;
};

export const getIsAdmin = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.IS_ADMIN) === 'true';
};

export const setAdmin = (isAdmin: boolean) => {
  localStorage.setItem(STORAGE_KEYS.IS_ADMIN, String(isAdmin));
};

// Article Operations
export const getArticles = (): Article[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ARTICLES);
  let articles: Article[] = [];

  if (data && data !== '[]') {
    try {
      articles = JSON.parse(data);
    } catch (e) {
      articles = [];
    }
  } else {
    // If local storage is empty, use the SEED_ARTICLES (Your published content)
    // This allows visitors to see your content without a database
    articles = SEED_ARTICLES;
    
    // Optional: Save seed to local storage so the user can interact with it (like locally)
    if (SEED_ARTICLES.length > 0) {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(SEED_ARTICLES));
    }
  }

  // Cleanup legacy test ids if needed
  const cleanArticles = articles.filter(a => a.id !== '1' && a.id !== '2');
  return cleanArticles;
};

export const getArticleById = (id: string): Article | undefined => {
  const articles = getArticles();
  return articles.find(a => a.id === id);
};

export const saveArticle = (articleData: ArticleFormData, id?: string): Article => {
  const articles = getArticles();
  const now = Date.now();
  
  if (id) {
    // Update
    const index = articles.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Article not found');
    
    const existingArticle = articles[index];
    const updated: Article = {
      ...existingArticle,
      ...articleData,
      likedBy: existingArticle.likedBy || [], // Ensure likedBy is preserved and exists
      updatedAt: now,
    };
    articles[index] = updated;
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
    return updated;
  } else {
    // Create
    const newArticle: Article = {
      id: Math.random().toString(36).substr(2, 9),
      ...articleData,
      likes: 0, // Ensure new articles start with 0 likes
      likedBy: [],
      createdAt: now,
      updatedAt: now,
    };
    articles.unshift(newArticle);
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
    return newArticle;
  }
};

export const deleteArticle = (id: string) => {
  // Get current articles directly to ensure we have the latest list
  const articles = getArticles();
  const filteredArticles = articles.filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(filteredArticles));
};

// Like System
export const toggleLike = (articleId: string): Article | undefined => {
  const articles = getArticles();
  const index = articles.findIndex(a => a.id === articleId); 
  
  if (index === -1) return undefined;

  const article = articles[index];
  const userId = getUserId();
  const currentLikedBy = article.likedBy || []; // Safety fallback
  const hasLiked = currentLikedBy.includes(userId);

  let updatedArticle: Article;

  if (hasLiked) {
    updatedArticle = {
      ...article,
      likes: Math.max(0, article.likes - 1),
      likedBy: currentLikedBy.filter(uid => uid !== userId),
    };
  } else {
    updatedArticle = {
      ...article,
      likes: article.likes + 1,
      likedBy: [...currentLikedBy, userId],
    };
  }

  articles[index] = updatedArticle;
  localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
  return updatedArticle;
};

// Comment Operations
export const getComments = (articleId: string): Comment[] => {
  const allComments: Comment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS) || '[]');
  return allComments.filter(c => c.articleId === articleId).sort((a, b) => b.createdAt - a.createdAt);
};

export const addComment = (articleId: string, name: string, email: string, content: string): Comment => {
  const allComments: Comment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS) || '[]');
  const newComment: Comment = {
    id: Math.random().toString(36).substr(2, 9),
    articleId,
    commenterName: name,
    commenterEmail: email,
    content,
    createdAt: Date.now(),
  };
  
  allComments.push(newComment);
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(allComments));
  return newComment;
};

export const deleteComment = (commentId: string) => {
  const allComments: Comment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS) || '[]');
  const filteredComments = allComments.filter(c => c.id !== commentId);
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(filteredComments));
};

// ===== SAMPLE DATA GENERATOR =====
export const loadSampleData = () => {
  const samples: Article[] = [
    {
      id: "sample_1",
      title: "The Art of Ocean Minimalism",
      excerpt: "Why the sea teaches us to let go of the unnecessary and find peace in the vastness.",
      content: "The ocean is the ultimate minimalist.\n\nIt doesn't hoard. It washes away footprints on the sand with every tide. It accepts the rain and reflects the sky without judgment. In our digital lives, we tend to accumulate—files, notifications, worries. But standing by the shore, looking at the horizon, we realize how little we actually need.\n\nMinimalism isn't just about having fewer things; it's about making room for more of what matters. Like the ocean makes room for the whales, the reefs, and the light.",
      coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
      tags: ["minimalism", "philosophy"],
      status: "published",
      likes: 42,
      likedBy: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: "sample_2",
      title: "Coding with the Tide",
      excerpt: "How natural rhythms can improve your programming flow state.",
      content: "There is a rhythm to good code, just like the tide coming in and out.\n\nPush and pull. Request and response. Try and catch.\n\nWhen we fight against the current—forcing logic where it doesn't fit, working through exhaustion—we crash. But when we learn to surf the waves of our own creativity, coding becomes less like engineering and more like art.",
      coverImage: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&auto=format&fit=crop",
      tags: ["coding", "productivity"],
      status: "published",
      likes: 128,
      likedBy: [],
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000
    }
  ];
  localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(samples));
  return samples;
};
