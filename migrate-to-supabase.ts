import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

async function migrate() {
  console.log('🚀 Starting migration to Supabase...');

  try {
    // Read songs.json
    const jsonPath = path.join(process.cwd(), 'src/data/songs.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const songs: Song[] = JSON.parse(jsonContent);

    console.log(`📖 Loaded ${songs.length} songs from songs.json`);

    // Create table if it doesn't exist
    console.log('📋 Creating songs table...');
    const { error: tableError } = await supabase.rpc('create_songs_table', {});
    // This will fail if table already exists, which is fine

    // Insert songs
    console.log('💾 Inserting songs into Supabase...');
    
    // Delete existing songs first (optional)
    const { error: deleteError } = await supabase.from('songs').delete().neq('id', -1);
    if (deleteError) {
      console.warn('⚠️  Could not delete existing songs:', deleteError.message);
    }

    // Insert new songs
    const { error: insertError, data } = await supabase
      .from('songs')
      .insert(songs)
      .select();

    if (insertError) {
      throw insertError;
    }

    console.log(`✅ Successfully migrated ${data?.length || songs.length} songs!`);
    console.log('🎉 Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
