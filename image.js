const themeToggle = document.querySelector(".theme-toggle");
const propmtbtn = document.querySelector(".prompt-btn");
const promptinput = document.querySelector(".prompt-input");
const promptForm = document.querySelector(".prompt-form");

const modelsel = document.querySelector("#model-select");
const countsel = document.querySelector("#count-select");
const ratiosel = document.querySelector("#ratio-select");

const grid = document.querySelector(".gallery-grid");

const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
  "A cosmic beach with glowing sand and an aurora in the night sky",
  "A medieval marketplace with colorful tents and street performers",
  "A cyberpunk city with neon signs and flying cars at night",
  "A peaceful bamboo forest with a hidden ancient temple",
  "A giant turtle carrying a village on its back in the ocean",
];

propmtbtn.addEventListener("click", () => {
  promptinput.value = examplePrompts[0];
  promptinput.focus();
});

// ✅ doğru çalışan dimension fonksiyonu
const getdimesn = (aspectratio, baseSize = 512) => {
  const [w, h] = aspectratio.split("/").map(Number);
  const scalefactor = baseSize / Math.sqrt(w * h);

  let calculatedw = Math.round(w * scalefactor);
  let calculatedh = Math.round(h * scalefactor);

  calculatedw = Math.floor(calculatedw / 16) * 16;
  calculatedh = Math.floor(calculatedh / 16) * 16;

  return { width: calculatedw, height: calculatedh };
};

// ✅ kartın içini doğru güncelle
const updatecard = (imgindex, imgUrl) => {
  const imgcard = document.getElementById(`img-card-${imgindex}`);
  if (!imgcard) return;

  imgcard.innerHTML = `
    <img src="${imgUrl}" class="result-img"/>
    <div class="img-overlay">
      <button class="img-download-btn" type="button">
        <i class="fa-solid fa-download"></i>
      </button>
    </div>
  `;
};

const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
  const model_url = `https://api-inference.huggingface.co/models/${selectedModel}`;
  const { width, height } = getdimesn(aspectRatio);

  const promises = Array.from({ length: imageCount }, async (_, i) => {
    try {
      const response = await fetch(model_url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`, // ❗ demo dışında backend'e taşı
          "Content-Type": "application/json",
          "x-use-cache": "false",
        },
        body: JSON.stringify({
          inputs: promptText,
          parameters: { width, height },
        }),
      });

      if (!response.ok) {
        // HF bazen JSON hata döndürür; text okuyup gösterelim
        const errText = await response.text();
        throw new Error(errText);
      }

      const result = await response.blob();
      updatecard(i, URL.createObjectURL(result));
    } catch (error) {
      console.log(error);
      updatecard(i, ""); // istersen buraya hata UI basarız
    }
  });

  await Promise.allSettled(promises);
};

const createImageCards = (selectedModel, imageCount, aspectRatio, promptText) => {
  grid.innerHTML = "";

  for (let index = 0; index < imageCount; index++) {
    grid.innerHTML += `
      <div class="img-card" id="img-card-${index}" style="aspect-ratio: ${aspectRatio};">
        <div class="img-overlay">
          <button class="img-download-btn" type="button">
            <i class="fa-solid fa-download"></i>
          </button>
        </div>
      </div>
    `;
  }

  generateImages(selectedModel, imageCount, aspectRatio, promptText);
};

promptForm.addEventListener("submit", (e) => {
  e.preventDefault();

  createImageCards(
    modelsel.value,
    parseInt(countsel.value, 10),
    ratiosel.value || "1/1",
    promptinput.value.trim()
  );
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
});




