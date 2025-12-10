import { Article } from '../types';
import { db } from './firebase';
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';

const ADMIN_KEY = 'isAdmin';
const ARTICLES_COLLECTION = 'articles';

// Admin Authentication (remains in localStorage)
export const setIsAdmin = (isAdmin: boolean): void => {
  try {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(isAdmin));
  } catch (error) {
    console.error('Error saving admin status to localStorage', error);
  }
};

export const getIsAdmin = (): boolean => {
  try {
    const isAdmin = localStorage.getItem(ADMIN_KEY);
    return isAdmin ? JSON.parse(isAdmin) : false;
  } catch (error) {
    console.error('Error getting admin status from localStorage', error);
    return false;
  }
};

// Article Management with Firestore
const articlesCollection = collection(db, ARTICLES_COLLECTION);

export const getAllArticles = async (): Promise<Article[]> => {
  try {
    const querySnapshot = await getDocs(articlesCollection);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        content: data.content,
        date: (data.date as Timestamp).toDate().toISOString(),
      };
    });
  } catch (error) {
    console.error('Error getting articles from Firestore', error);
    return [];
  }
};

export const getArticleById = async (id: string): Promise<Article | undefined> => {
  try {
    const articleDoc = doc(db, ARTICLES_COLLECTION, id);
    const docSnap = await getDoc(articleDoc);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        content: data.content,
        date: (data.date as Timestamp).toDate().toISOString(),
      };
    } else {
      console.log('No such document!');
      return undefined;
    }
  } catch (error) {
    console.error('Error getting article by ID from Firestore', error);
    return undefined;
  }
};

export const createArticle = async (article: Omit<Article, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(articlesCollection, {
      ...article,
      date: new Date(article.date),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating article in Firestore', error);
    throw error;
  }
};

export const updateArticle = async (id: string, article: Partial<Omit<Article, 'id'>>): Promise<void> => {
  try {
    const articleDoc = doc(db, ARTICLES_COLLECTION, id);
    await updateDoc(articleDoc, {
      ...article,
      ...(article.date && { date: new Date(article.date) }),
    });
  } catch (error) {
    console.error('Error updating article in Firestore', error);
    throw error;
  }
};

export const deleteArticle = async (id: string): Promise<void> => {
  try {
    const articleDoc = doc(db, ARTICLES_COLLECTION, id);
    await deleteDoc(articleDoc);
  } catch (error) {
    console.error('Error deleting article from Firestore', error);
    throw error;
  }
};
