const bars = document.getElementById("size")
const close = document.getElementById("close")
const nav = document.getElementById("navbar")

if(bars){
    bars.addEventListener('click', () =>{
   nav.classList.add('active')
    });
}

if(close){
    close.addEventListener('click', () =>{
   nav.classList.remove('active')
    });
}

 
let currentUser = localStorage.getItem('yt_user') || "";
let myPass = localStorage.getItem('yt_pass') || "";
let comments = JSON.parse(localStorage.getItem('yt_comments')) || [];
let ratings = JSON.parse(localStorage.getItem('yt_ratings')) || [];
let userLikedIds = JSON.parse(localStorage.getItem('user_liked_ids')) || [];

window.onload = () => {
    if(currentUser) showUI();
    renderComments();
    updateAvgRating();
};

function setUser() {
    const user = document.getElementById('username-input').value.trim();
    const pass = document.getElementById('password-input').value.trim();
    const errorMsg = document.getElementById('setup-error');
    
    errorMsg.style.display = 'none';

    if (user && pass) {
        // Check if name is already taken by someone else in the comments
        const isTaken = comments.some(c => c.user.toLowerCase() === user.toLowerCase() && c.pass !== pass);
        
        if (isTaken) {
            errorMsg.innerText = "Username has been taken!";
            errorMsg.style.display = 'block';
            return;
        }

        currentUser = user;
        myPass = pass;
        localStorage.setItem('yt_user', user);
        localStorage.setItem('yt_pass', pass);
        showUI();
    }
}

function showUI() {
    document.getElementById('user-setup').style.display = 'none';
    document.getElementById('reset-section').style.display = 'block';
    document.getElementById('comment-controls').style.display = 'block';
    document.getElementById('display-name').innerText = currentUser;
}

function resetName() {
    const newName = document.getElementById('new-username').value.trim();
    const passInput = document.getElementById('verify-pass').value.trim();
    const errorMsg = document.getElementById('reset-error');
    
    errorMsg.style.display = 'none';

    if (passInput === myPass && newName !== "") {
        const isTaken = comments.some(c => c.user.toLowerCase() === newName.toLowerCase() && c.pass !== myPass);
        
        if (isTaken) {
            errorMsg.innerText = "Username has been taken!";
            errorMsg.style.display = 'block';
            return;
        }

        // Update name on old comments
        comments.forEach(c => { if(c.pass === myPass) c.user = newName; });
        currentUser = newName;
        localStorage.setItem('yt_user', newName);
        localStorage.setItem('yt_comments', JSON.stringify(comments));
        document.getElementById('display-name').innerText = newName;
        renderComments();
    } else {
        errorMsg.innerText = "Incorrect Password!";
        errorMsg.style.display = 'block';
    }
}

function postComment() {
    const text = document.getElementById('comment-text').value;
    if (!text.trim()) return;
    comments.unshift({ id: Date.now(), user: currentUser, pass: myPass, text: text, likes: 0 });
    localStorage.setItem('yt_comments', JSON.stringify(comments));
    renderComments();
    document.getElementById('comment-text').value = "";
}

function rateWeb(n) {
    const index = ratings.indexOf(n);
    index > -1 ? ratings.splice(index, 1) : ratings.push(n);
    localStorage.setItem('yt_ratings', JSON.stringify(ratings));
    updateAvgRating();
}

function updateAvgRating() {
    if (!ratings.length) return;
    const avg = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
    document.getElementById('avg-display').innerText = avg;
    document.querySelectorAll('.star-big').forEach((s, i) => s.classList.toggle('active', ratings.includes(i + 1)));
}

function renderComments() {
    const container = document.getElementById('comments-container');
    container.innerHTML = comments.map(c => `
        <div class="input-row" style="margin-bottom:20px;">
            <div class="profile-circle">ifashionn</div>
            <div style="flex:1;">
                <div style="font-weight:bold; font-size:13px;">@${c.user}</div>
                <div style="font-size:14px;">${c.text}</div>
                <div style="display:flex;">
                    <button class="action-btn ${userLikedIds.includes(c.id) ? 'liked' : ''}" onclick="like(${c.id})">👍 ${c.likes}</button>
                    ${c.pass === myPass ? `<button class="action-btn" onclick="del(${c.id})" style="color:red">Delete</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function del(id) {
    comments = comments.filter(c => c.id !== id);
    localStorage.setItem('yt_comments', JSON.stringify(comments));
    renderComments();
}

function like(id) {
    const c = comments.find(x => x.id === id);
    if (userLikedIds.includes(id)) {
        c.likes = 0;
        userLikedIds = userLikedIds.filter(i => i !== id);
    } else {
        c.likes = 1;
        userLikedIds.push(id);
    }
    localStorage.setItem('user_liked_ids', JSON.stringify(userLikedIds));
    localStorage.setItem('yt_comments', JSON.stringify(comments));
    renderComments();
}
function deleteComment(buttonElement) {
    const comment = buttonElement.closest('.comment-entry');
    if (comment) {
        comment.remove();
    }
}


// Database of products - Link your images here
const products = [
  { name: "short jeans", price: "$99.5", img: "baggi-1.jpg" },
  { name: "men designer", price: "$580", img: "cap7.jpg" },
  { name: "urban cap", price: "$80", img: "cap-2.jpg" }


                 
];

const wrapper = document.getElementById('search-container');
const input = document.getElementById('search-input');
const display = document.getElementById('results-display');
const card = document.getElementById('product-card');
const confirmUI = document.getElementById('confirmation-ui');
const statusMsg = document.getElementById('status-msg');

function toggleSearch() {
  wrapper.classList.toggle('hidden');
  if (!wrapper.classList.contains('hidden')) input.focus();
}

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});

function handleSearch() {
  const query = input.value.toLowerCase();
  const match = products.find(p => p.name.toLowerCase().includes(query));

  // Reset UI
  statusMsg.classList.add('hidden');
  confirmUI.classList.add('hidden');
  display.classList.remove('hidden');

  if (match) {
    card.innerHTML = `
      <img src="${match.img}" class="product-img">
      <h3>${match.name}</h3>
      <p>${match.price}</p>
    `;
    confirmUI.classList.remove('hidden');
  } else {
    card.innerHTML = "<p>No products found.</p>";
    confirmFailure(); // Show the "get back to you" msg if nothing found
  }
}

function confirmSuccess() {
  card.innerHTML = "<h3>Awesome! Happy shopping!</h3>";
  confirmUI.classList.add('hidden');
  setTimeout(closeAll, 2000);
}

function confirmFailure() {
  confirmUI.classList.add('hidden');
  statusMsg.classList.remove('hidden');
  setTimeout(closeAll, 3500);
}

function closeAll() {
  display.classList.add('hidden');
  wrapper.classList.add('hidden');
  input.value = "";
}

function startLoadingSequence() {
    const loader = document.getElementById("site-preloader");
    const bar = document.querySelector(".preloader-fill");

    if (!loader || !bar) return;

    // Reset view
    loader.classList.remove("preloader-hidden");
    loader.style.display = "flex";
    bar.classList.remove("start-animating");

    // Force restart animation
    void bar.offsetWidth; 

    // Start 10s animation
    bar.classList.add("start-animating");

    // Wait 10 seconds then hide
    setTimeout(() => {
        loader.classList.add("preloader-hidden");
        setTimeout(() => {
            loader.style.display = "none";
        }, 800);
    }, 10000); 
}
function closeAll() {
  document.getElementById('results-display').classList.add('hidden');
  document.getElementById('search-container').classList.add('hidden');
  document.getElementById('search-input').value = "";
}

function confirmSuccess() {
  card.innerHTML = `
    <div style="color: #28a745; font-weight: bold;">✓ Product Confirmed!</div>
    <p>Use code <strong>SAVE10</strong> for a discount.</p>
    <a href="https://wa.me" class="btn-yes" style="text-decoration:none; display:block; margin-top:10px;">
      Order via WhatsApp
    </a>
  `;
  confirmUI.classList.add('hidden');
  // We don't auto-close so they can click the link
}

window.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("site-preloader");
    
    if (!sessionStorage.getItem("hasLoaded")) {
        startLoadingSequence();
        sessionStorage.setItem("hasLoaded", "true");
    } else if (loader) {
        loader.style.display = "none";
    }
});

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        startLoadingSequence();
    }
});
const sleekObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // When box enters the screen, animate it IN
            entry.target.classList.add('active');
        } else {
            // When box leaves the screen, reset it so it can animate AGAIN
            entry.target.classList.remove('active');
        }
    });
}, { 
    threshold: 0.1, // Starts the animation as soon as the edge of the box appears
    rootMargin: "-20px" // Adds a small buffer for a cleaner look
});

window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reveal').forEach(el => {
        sleekObserver.observe(el);
    });
});


// 1. Initialize with your Public Key
emailjs.init("_ucQE08XgYYEqbs9O");

function sendMail(event) {
    if (event) event.preventDefault();

    // 2. Capture values (Ensure IDs match your HTML elements)
    let parms = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        subject: document.getElementById("subject").value,
        message: document.getElementById("message").value
    };

    // 3. Send using your Service and Template IDs
    emailjs.send("service_hvoc016", "template_7x0cgfl", parms)
        .then((response) => {
            console.log("SUCCESS!", response.status, response.text);
            alert("Email Sent!!");
            // Optional: Reset form after success
            document.getElementById("contact-form").reset(); 
        })
        .catch((error) => {
            console.error("FAILED...", error);
            alert("Failed to send email. Check console for details.");
        });
}


