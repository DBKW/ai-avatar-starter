const generateAction = async (req, res) => {
    const input = JSON.parse(req.body).input;
    
    // Add fetch request to Hugging Face
    const response = await fetch(
      `https://api-inference.huggingface.co/models/michaelkmccoy/dbkw`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_AUTH_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: input,
        }),
      }
    );

    console.log(response  + 'response');
    if (response.ok) {
        console.log(response);
        const buffer = await response.arrayBuffer();
        const base64 = bufferToBase64(buffer);
        res.status(200).json({ image: bufferToBase64(buffer) });
    }   else if (response.status === 503) {
        const json = await response.json();
        res.status(503).json(json);
    }   else {
        const json = await response.json();
        res.status(response.status).json({ error: response.statusText });
    }
  };

  const bufferToBase64 = (buffer: ArrayBuffer) => {
    let arr = new Uint8Array(buffer);
    const base64 = btoa(
      arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    return `data:image/png;base64,${base64}`;
  };
  
  export default generateAction;
