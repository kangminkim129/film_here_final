const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgpbzqikhkeigwvctqji.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncGJ6cWlraGtlaWd3dmN0cWjiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDc3NTQsImV4cCI6MjA5NTc4Mzc1NH0.7PAZOaJa9AUHd1H53Qco1Y59IwnLswPpmtQtXZU6yjQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  console.log('Testing connection to Supabase...');
  const { data, error } = await supabase.from('spots').select('*').limit(5);
  
  if (error) {
    console.error('Fetch error:', error);
  } else {
    console.log('Successfully fetched spots:', data.length);
    console.log('First spot:', data[0]);
  }
}

testFetch();
