// Quick test file to debug YouTube integration
// Run with: node scripts/test-youtube.mjs

async function testYouTubeIntegration() {
  // Read .env file manually
  const fs = await import('fs');
  const path = await import('path');
  
  try {
    const envPath = path.resolve('.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    console.log('📁 .env file contents:');
    console.log(envContent);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Parse env variables
    const envLines = envContent.split('\n');
    const envVars = {};
    
    envLines.forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        envVars[key.trim()] = value.trim();
      }
    });
    
    const apiKey = envVars.PUBLIC_YOUTUBE_API_KEY;
    const channelId = envVars.PUBLIC_YOUTUBE_CHANNEL_ID;
    
    console.log('🔑 Parsed environment variables:');
    console.log(`API Key: ${apiKey || 'NOT SET'}`);
    console.log(`Channel ID: ${channelId || 'NOT SET'}`);
    
    if (!apiKey || apiKey === 'your_youtube_api_key_here') {
      console.log('\n❌ YouTube API key not configured properly');
      console.log('💡 Follow the setup steps in the README');
      return;
    }
    
    if (!channelId || channelId === 'your_channel_id_here') {
      console.log('\n❌ YouTube Channel ID not configured');
      console.log('💡 Run: node scripts/get-youtube-channel-id.mjs ' + apiKey);
      return;
    }
    
    // Test API call
    console.log('\n🧪 Testing YouTube API call...');
    
    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&order=date&maxResults=3&type=video`;
    console.log('📡 API URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.log('\n❌ API Error:', data.error.message);
      console.log('💡 Details:', data.error);
      return;
    }
    
    if (!data.items || data.items.length === 0) {
      console.log('\n⚠️  No videos found in channel');
      console.log('💡 Possible reasons:');
      console.log('   - Channel has no public videos');
      console.log('   - Channel ID is incorrect');
      console.log('   - Videos are set to private/unlisted');
      
      // Test if channel exists
      const channelUrl = `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&id=${channelId}&part=snippet,statistics`;
      const channelResponse = await fetch(channelUrl);
      const channelData = await channelResponse.json();
      
      if (channelData.items && channelData.items.length > 0) {
        const channel = channelData.items[0];
        console.log('\n📺 Channel info:');
        console.log(`   Name: ${channel.snippet.title}`);
        console.log(`   Videos: ${channel.statistics.videoCount}`);
        console.log(`   Description: ${channel.snippet.description}`);
      }
      return;
    }
    
    console.log(`\n✅ Success! Found ${data.items.length} videos:`);
    data.items.forEach((video, index) => {
      console.log(`${index + 1}. ${video.snippet.title}`);
      console.log(`   Published: ${video.snippet.publishedAt}`);
      console.log(`   Video ID: ${video.id.videoId}`);
      console.log('');
    });
    
    console.log('🎉 YouTube integration should work now!');
    console.log('💡 Restart your dev server: bun run dev');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testYouTubeIntegration();