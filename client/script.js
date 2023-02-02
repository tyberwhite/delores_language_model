import bot from "./assets/bot.svg";
import user from "./assets/user.svg";
import delores from "./assets/delores.png";

const form = document.querySelector("form");
const chatContainer = document.querySelector(".chat_container");

let loadInterval;

// Renders three dots to the input element while loading response
function loader(element) {
  element.textContent = "";

  // Every 300ms add another dot. If three dots, reset text content
  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

// Typing effect that generates one letter at a time
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 30);
}

// Generate a unique ID for each message
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

// Chat container
function chatStripe(isAi, value, uniqueId) {
  return `
      <div class="wrapper" ${isAi && "ai"} >
        <div class="chat">
          <div class="profile">
            <img 
              src="${isAi ? bot : user}"
              alt="${isAi ? "bot" : "user"}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `;
}

// Handle submissions
const handleSubmit = async (e) => {
  // Prevent default browser behavior so browser doesn't reload on form submission
  e.preventDefault();

  const data = new FormData(form);

  // Modify message with Grammy prefix prompt
  const grammyMessage = `Answer this question as if you were a funny, whacky, 90 year old woman with dementia who forgets things and says random things like a funny dementia patient would ${data.get(
    "prompt"
  )}`;

  console.log(grammyMessage);
  // user's chatStripe
  chatContainer.innerHTML = chatStripe(false, data.get("prompt"));
  form.reset();

  // bot's chatStripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // Scroll to maintain message in view
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // Fetch data from server

  const serverLocation = "https://delores.onrender.com/";

  const response = await fetch(serverLocation, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: grammyMessage,
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const error = await response.text();

    messageDiv.innerHTML = "Something went wrong";
    alert(error);
  }
};

form.addEventListener("submit", handleSubmit);

// Add event listener to enter key - Avoid using "event.keyCode" (deprecated)
form.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    handleSubmit(event);
  }
});
