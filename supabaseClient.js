// Initialize Supabase client (values are injected via environment or replaced at deploy time)
const supabaseUrl = window.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// The CDN exposes a global `supabase` object with createClient
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function getCurrentUser() {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error) {
    console.error('Error getting current user', error);
    return null;
  }
  return data.user;
}

async function requireAuth(redirectIfMissing = '../public_pages/login.html') {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = redirectIfMissing;
    return null;
  }
  return user;
}

async function getUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabaseClient
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  if (error) {
    console.error('Error loading user profile', error);
    return null;
  }
  return data;
}

async function getWorkerRatings(workerId) {
  const { data, error } = await supabaseClient
    .from('ratings')
    .select('*')
    .eq('worker_id', workerId);
  if (error) {
    console.error('Error loading ratings', error);
    return [];
  }
  return data || [];
}

function calculateAverageRating(ratings) {
  if (!ratings || !ratings.length) return { average: 0, count: 0 };
  const sum = ratings.reduce((acc, r) => acc + (r.score || 0), 0);
  return { average: sum / ratings.length, count: ratings.length };
}

// Simple toast notifications, reusable across pages
function ensureToastContainer() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type = 'info') {
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-message">${message}</div>
    <button class="toast-close" aria-label="Close">&times;</button>
  `;
  container.appendChild(toast);

  const remove = () => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  };

  toast.querySelector('.toast-close').addEventListener('click', remove);
  setTimeout(remove, 5000);
}


