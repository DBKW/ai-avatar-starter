
import { useCallback, useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';

const Home = () => {
  const maxRetries = 20;
  const [input, setInput] = useState('');
  const [img, setImg] = useState('');
  const [retry, setRetry] = useState(0);
  const [retryCount, setRetryCount] = useState(maxRetries);
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [promptArray, setPromptArray] = useState([
    "Kelly as 'pixar character, baseball player, photorealistic, hdr, symmetrical face, 4k, 8k",
    "Kelly as a 'pirate, astronaut, dragon', cartoonish, hdr, asymmetrical face, 4k, 8k",
    "Kelly as a 'magician, superhero, warrior', photorealistic, hdr, symmetrical face, 4k, 8k",
    "Kelly as a 'chef, detective, explorer', cartoonish, hdr, asymmetrical face, 4k, 8k",
    "Kelly as samurai master, character art portrait, anime key visual, strong face, 8 k wallpaper, very high detailed, sharp focus, morandi color scheme, art station, by krenz cushart",
    "Kelly as Pikachu commiting tax fraud, paperwork, exhausted, cute, really cute, cozy, by steve hanks, by lisa yuskavage, by serov valentin, by tarkovsky, 8 k render, detailed, cute cartoon style",
    "Futuristic Vintage Medium Shot 1920's Poster with Cyberpunk, Kelly as a tron biker, with a cyberpunk city background, futuristic lighting, cinematic lighting, cozy lighting, 8k, cinematic poster vintage 1800s",
    "Kelly as a cyborg pilot Russian man, interior cockpit, hyperdetailed, by john blanche",
    "Kelly in a darkseid character portrait, wearing a black cloak, holding a large platinum shield, by peter mohrbacher, mark brooks, jim burns, wadim kashin, greg rutkowski, larry elmore, esao andrews, trending on artstation",
    "Kelly is a cinematic portrait as a cute Mew riding large blue bubble, oil on canvas, masterpiece, trending on artstation, featured on pixiv, cinematic composition, dramatic pose, beautiful lighting, sharp, details, hyper-detailed, HD, HDR, 4K, 8K",
    "Kelly as a spanish singer, eat grapes, divan, smoke, reinaissance, realism, dark ambience, velazquez",
    "Kelly as a Manly muscular cat hybrid stroking chin under neon lights alleyway"
  ])

  const generateAction = async () => {
    console.log('Generating...');
    if (isGenerating && retry === 0) return;

    setIsGenerating(true);

    if (retry > 0)  {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0;
        } else {
          return prevState - 1;
        }
      });

      setRetry(0);
    }
    const finalInput = input.replace(/kelly/gi, 'dbkw');

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: JSON.stringify({ input }),
    });

    const data = await response.json();

    if (response.status === 503) {
      setRetry(data.estimated_time);
      return;
    }

    if (!response.ok) {
      console.log('Error: ${data.error}')
      // Stop loading
      setIsGenerating(false);
      return;
    }

    setFinalPrompt(input);
    setInput('');
    setImg(data.image);
    setIsGenerating(false);
  };
  
  //Add randomPrompt function
  const randomPrompt = () => {
    const randomNumber = Math.floor(Math.random() * (promptArray.length));
    setInput(promptArray[randomNumber]);
  };

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  const onChange = (event) => {
    setInput(event.target.value);
  };

  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(`Model still loading after ${maxRetries} retries. Try request again in 5 minutes.`);
        setRetryCount(maxRetries);
        setIsGenerating(false);
        return;
      }

      console.log(`Trying again in ${retry} seconds.`);

      await sleep(retry * 1000);

      await generateAction();
    };

    if (retry === 0) {
      return;
    }

    runRetry();
  }, [retry]);
	
  return (

    <div className="root">
      <Head>
        <title>DBKW's AI Avatar Generator | buildspace</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>It is your chance to change me!</h1>
          </div>
          <div className="header-subtitle">
            <h2>
              Insert a prompt using "Kelly" as the subject and see what comes out!
            </h2>
          </div>
          <div className="text">
            <h5>
               Try using a prompt like: Kelly as 'pixar character, baseball player, politician', photorealistic, hdr, symmetrical face, 4k, 8k
            </h5>
          </div>
          {/* Add prompt container here */}
          <div className="prompt-container">
            <input className='prompt-box' value={input} onChange={onChange} />
            <div className="prompt-buttons">
                <a
                    className={
                        isGenerating ? 'generate-button loading' : 'generate-button'
                    }
                    onClick={generateAction}
                    >
                        <div className="generate">
                            {isGenerating ? (
                                <span className="loader"></span>
                            ) : (
                            <p>Generate</p>
                            )}
                        </div>
                    </a>
                <a
                    className={
                        isGenerating ? 'generate-button loading' : 'generate-button'
                    }
                    onClick={randomPrompt}
                    >
                        <div className="generate">
                            {isGenerating ? (
                                <span></span>
                            ) : (
                            <p>Random Prompt</p>
                            )}
                        </div>
                    </a>
                </div>
            </div>
        {img && (
        <div className="output-content">
          <Image src={img} width={512} height={512} alt={finalPrompt} />
            <p>{finalPrompt}</p>
        </div>
        )}
      </div>
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-avatar"
          target="_blank"
          rel="noreferrer"
        >
            <div className="badge">   
                <Image src={buildspaceLogo} alt="buildspace logo" />
                <p>build with buildspace</p>
            </div>
        </a> 
    </div>
</div>
</div>
  );
};

export default Home;
