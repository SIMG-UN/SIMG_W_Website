// YouTube Channel ID Helper Script
// Run with: node scripts/get-youtube-channel-id.mjs YOUR_API_KEY

const apiKey = process.argv[2];
const channelHandle = 'simg-UN'; // Your @simg-UN handle

if (!apiKey) {
  console.log('❌ Usage: node scripts/get-youtube-channel-id.mjs YOUR_API_KEY');
  process.exit(1);
}

async function getChannelInfo() {
  try {
    console.log('🔍 Looking up channel info for @simg-UN...\n');

    // Method 1: Try by forUsername (newer channels)
    let url = `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&forUsername=${channelHandle}&part=snippet,statistics`;
    let response = await fetch(url);
    let data = await response.json();

    if (data.items && data.items.length > 0) {
      const channel = data.items[0];
      console.log('✅ Channel found via username:');
      console.log(`   📺 Channel Name: ${channel.snippet.title}`);
      console.log(`   🆔 Channel ID: ${channel.id}`);
      console.log(`   📹 Video Count: ${channel.statistics.videoCount}`);
      console.log(`   👥 Subscriber Count: ${channel.statistics.subscriberCount}`);
      console.log(`\n📋 Add this to your .env file:`);
      console.log(`PUBLIC_YOUTUBE_CHANNEL_ID=${channel.id}`);
      return;
    }

    // Method 2: Search by channel name
    url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&q=SIMG+semillero&type=channel&part=snippet`;
    response = await fetch(url);
    data = await response.json();

    if (data.items && data.items.length > 0) {
      console.log('📺 Found these channels that might match:\n');
      data.items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.snippet.title}`);
        console.log(`   🆔 Channel ID: ${item.snippet.channelId}`);
        console.log(`   📝 Description: ${item.snippet.description.substring(0, 100)}...`);
        console.log('');
      });
      console.log('📋 If one of these is correct, add to your .env file:');
      console.log(`PUBLIC_YOUTUBE_CHANNEL_ID=${data.items[0].snippet.channelId}`);
    } else {
      console.log('❌ Could not find channel. Possible solutions:');
      console.log('   1. Check if channel is public');
      console.log('   2. Try searching manually: https://www.googleapis.com/youtube/v3/search?key=YOUR_KEY&q=SIMG&type=channel&part=snippet');
      console.log('   3. Go to your channel → About → Share → Copy channel ID');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('quota')) {
      console.log('💡 YouTube API quota exceeded. Try again tomorrow or get a new API key.');
    }
  }
}

// Test the API key first
async function testApiKey() {
  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${apiKey}&q=test&type=video&part=snippet&maxResults=1`);
    const data = await response.json();
    
    if (data.error) {
      console.log('❌ API Key Error:', data.error.message);
      return false;
    }
    
    console.log('✅ API Key is valid!\n');
    return true;
  } catch (error) {
    console.log('❌ API Key test failed:', error.message);
    return false;
  }
}

// Run the script
(async () => {
  const isValidKey = await testApiKey();
  if (isValidKey) {
    await getChannelInfo();
  }
})();