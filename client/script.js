import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

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
  }, 20);
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
  const grammyMessage = `Try and answer the question, but answer with random information that a 90 year old woman with dementia would use. Include some random information, and an indication that you're thinking or confused. ${data.get(
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
  const response = await fetch("http://localhost:8000", {
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
