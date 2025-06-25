console.log("lets begin..!")

let currentAudio = null;

let songs = [];


function formatTime(seconds) {
    const totalSeconds = Math.round(seconds); // Round to nearest whole number
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const paddedMins = mins.toString().padStart(2, '0');
    const paddedSecs = secs.toString().padStart(2, '0');
    return `${paddedMins}:${paddedSecs}`;
}


async function getsongs() {
    try {
        let a = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=820d73b7&format=json&limit=200`)
        let response = await a.json()

        response.results.forEach(element => {
            songs.push({
                url: element.audio,
                duration: element.duration,
                name: element.name,
                author: element.artist_name,
                img: element.image
            });
        });
        return songs;
    }
    catch (error) {
        console.log("An error has occured...Error:", error);
    }
}

async function playsong(url, playbutton, playpause) {


    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    const freshButton = playpause.cloneNode(true);
    playpause.replaceWith(freshButton);

    freshButton.addEventListener("click", () => {
        if (currentAudio.paused) {
            currentAudio.play();
            freshButton.innerHTML = `<img src="pause.svg" alt="pause-btn">`;
        } else {
            currentAudio.pause();
            freshButton.innerHTML = `<img src="playbutton.svg" alt="play-btn">`;
        }
    });

    // Reset all play buttons
    document.querySelectorAll('.play').forEach(btn => {
        btn.classList.remove('playing');
    });

    // Play new song
    currentAudio = new Audio(url);

    playpauseListener = () => {
        if (currentAudio.paused) {
            currentAudio.play();
            playpause.innerHTML = `<img src="pause.svg" alt="play-btn">`
        }
        else {
            currentAudio.pause();
            playpause.innerHTML = `<img src="playbutton.svg" alt="play-btn">`;
        }
    }

    playpause.addEventListener("click", playpauseListener);

    currentAudio.play().then(() => {
        // Add playing state to clicked button
        playbutton.classList.add('playing');
    }).catch(error => {
        console.error("Playback failed:", error);
    });

    // Add ended event listener
    currentAudio.addEventListener('ended', () => {
        playbutton.classList.remove('playing');
        currentAudio = null;
    });


    //time-update event
    currentAudio.addEventListener("timeupdate", () => {
        console.log(currentAudio.currentTime, currentAudio.duration);
        const duration1 = document.querySelector(".duration");
        duration1.innerHTML = `${formatTime(currentAudio.currentTime)}/${formatTime(currentAudio.duration)}`;

        document.querySelector(".circle").style.left = (currentAudio.currentTime / currentAudio.duration) * 100 + "%";
    });

    //seek-bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentAudio.currentTime = ((currentAudio.duration) * percent) / 100;
    });
}

async function main() {
    let songs = await getsongs();
    console.log(songs)

    //play first song
    //var audio = new Audio(songs[0].url);
    //let s1=`https://prod-1.storage.jamendo.com/?trackid=285&format=mp31&from=7tMRFqjRtOcBG4fgl%2BeQ8Q%3D%3D%7Ckm8v6Y62tAcw2bEy2uYgqg%3D%3D`
    //var audio= new Audio(s1);
    //audio.play()

    songs.forEach((song) => {
        const container11 = document.querySelector(".container1");

        const card1 = document.createElement("div");
        card1.className = "card";

        const image = document.createElement("img")
        image.src = song.img
        image.alt = "img"

        const title = document.createElement("h2")
        title.innerHTML = song.name;

        const artist = document.createElement("p")
        artist.innerHTML = song.author

        const playbutton = document.createElement("div")
        playbutton.className = "play"
        playbutton.innerHTML = ` <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="25" cy="25" r="24" fill="white" />
                                    <path d="M20 15 L20 35 L35 25 L20 15" fill="black" />
                                </svg>`

        playbutton.addEventListener("click", () => {
            const playpause = document.querySelector(".play-button")
            playpause.innerHTML = `<img src="pause.svg" alt="play-btn">`
            playsong(song.url, playbutton, playpause);
        });


        //Assemble the card
        card1.appendChild(image);
        card1.appendChild(title);
        card1.appendChild(artist);
        card1.appendChild(playbutton);
        container11.appendChild(card1);

        song.element = card1;
        songs.push(song);
    });

    document.body.appendChild(container11);
}

main();

document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0vw"
});

document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-150vw"
})


// Search functionality
const searchInput = document.querySelector(".search-input");

searchInput.addEventListener("input", e => {
    const value = e.target.value.toLowerCase().trim();

    songs.forEach(song => {
        const isVisible = song.name.toLowerCase().includes(value) || song.author.toLowerCase().includes(value)
        song.element.classList.toggle("hidden", !isVisible);
    })
});