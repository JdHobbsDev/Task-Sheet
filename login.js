const _0x2f1a = [

    btoa(JSON.stringify({u:'Ross',p:'a10e42a25b0478d89f0bc5d3882cf0ee'})),

    btoa(JSON.stringify({u:'Jack',p:'a10e42a25b0478d89f0bc5d3882cf0ee'})),

    btoa(JSON.stringify({u:'Jasper',p:'a10e42a25b0478d89f0bc5d3882cf0ee'}))
];

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
 
    const hashedPassword = CryptoJS.MD5(password).toString();
    console.log('Attempting login with:', {
        username: username,
        password: password,
        hash: hashedPassword
    });
    
    const isValid = _0x2f1a.some(encoded => {
        try {
            const decoded = JSON.parse(atob(encoded));
            console.log('Comparing with stored:', decoded);
            return decoded.u === username && decoded.p === hashedPassword;
        } catch {
            return false;
        }
    });
    
    if (isValid) {
        const timestamp = Date.now();
        const token = btoa(`${username}-${timestamp}-${hashedPassword}`);
        sessionStorage.setItem('auth_token', token);
        sessionStorage.setItem('currentUser', username);
        window.location.href = 'index.html';
    } else {
        alert('Invalid credentials! Please try again.');
    }
});


if (!window.location.href.includes('login.html')) {
    const token = sessionStorage.getItem('auth_token');
    const user = sessionStorage.getItem('currentUser');
    if (!token || !user || !validateToken(token, user)) {
        window.location.href = 'login.html';
    }
}

function validateToken(token, user) {
    try {
        const [username, timestamp, hash] = atob(token).split('-');
        return username === user && 
               (Date.now() - parseInt(timestamp)) < 24 * 60 * 60 * 1000; 
    } catch {
        return false;
    }
}
