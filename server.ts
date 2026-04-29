import express, { Request, Response } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors());
app.use(express.json());

// Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Type definitions
interface Song {
  id: number;
  title: string;
  artist: string;
  category: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
  description: string;
}

// GET /api/songs - Get all songs or filter
app.get('/api/songs', async (req: Request, res: Response) => {
  try {
    const { id, category, q, limit } = req.query;

    let query = supabase.from('songs').select('*');

    // Filter by ID
    if (id) {
      const songId = parseInt(id as string);
      const { data, error } = await query.eq('id', songId).single();
      
      if (error) {
        return res.status(404).json({ error: 'song not found' });
      }
      return res.json(data);
    }

    // Filter by category
    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    // Filter by search (title or artist)
    if (q) {
      const searchTerm = `%${q}%`;
      query = query.or(`title.ilike.${searchTerm},artist.ilike.${searchTerm}`);
    }

    // Order and limit
    query = query.order('id', { ascending: true });

    if (limit) {
      const limitNum = parseInt(limit as string);
      query = query.limit(limitNum);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/songs/:id - Get a single song by ID
app.get('/api/songs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const songId = parseInt(id as string);

    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('id', songId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'song not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/categories - Get all unique categories
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('category')
      .order('category', { ascending: true });

    if (error) {
      throw error;
    }

    const categories = Array.from(new Set((data || []).map(s => s.category)));
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🎵 Scout Player API running on port ${PORT}`);
  console.log(`📍 Supabase connected: ${supabaseUrl}`);
});
