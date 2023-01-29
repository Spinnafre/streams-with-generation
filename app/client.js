const url = "http://localhost:3000";

async function getDataStream(signal) {
  const data = await fetch(url, {
    signal,
  });

  return data.body;
}

async function startStreaming(signal) {
  const decoderStream = new TextDecoderStream("utf-8");

  const responseStream = await getDataStream(signal);

  return responseStream.pipeThrough(decoderStream);
}

function renderData(elementHTML) {
  return new WritableStream({
    start(controller) {
      console.log("[start] Starting write...");
    },
    write(chunk, controller) {
      try {
        const { _id, position, content, created_at } = JSON.parse(chunk);

        const template = `
            <article id="${_id}">
                <span>#${position}</span>
                <h2>${content.slice(0, 50) + "..."}</h2>
                <p>${content}</p>
                <time>${created_at}</time>
            </article>
        `;

        elementHTML.insertAdjacentHTML("afterbegin", template);
      } catch (error) {
        console.error("Error in write ", error);
        controller.error(error.message);
      }
    },
    close() {
      console.log("Closed stream...");
      alert("Stream finished");
    },
    abort(error) {
      console.error("Sink Error: ", error);
      alert("Stream aborted");
    },
  });
}

const buttonsIds = ["start", "stop"];
const cardsSelector = "#cards";

const [startStreamBtn, stopStreamBtn] = buttonsIds.map((id) =>
  document.getElementById(id)
);

const cards = document.querySelector(cardsSelector);

let abortController = new AbortController();

// https://developer.mozilla.org/en-US/docs/Web/API/CountQueuingStrategy
const queuingStrategy = new CountQueuingStrategy({
  highWaterMark: 1,
});

startStreamBtn.addEventListener("click", async (_) => {
  cards.innerHTML = "";
  const signal = abortController.signal;

  try {
    const readableStream = await startStreaming(signal);

    await readableStream.pipeTo(renderData(cards));
  } catch (error) {
    console.log("[Error] ", error.message);
  }
});

stopStreamBtn.addEventListener("click", (_) => {
  abortController.abort();
  abortController = new AbortController();
});
