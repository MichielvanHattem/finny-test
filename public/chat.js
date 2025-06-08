async function haalBestandenOp() {
  const token = localStorage.getItem('finny_token');
  
  try {
    const response = await fetch('/sp-files', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Kan bestanden niet laden');

    const files = await response.json();
    console.log('Bestanden:', files);
  } catch (error) {
    console.error('Fout:', error.message);
  }
}

haalBestandenOp();
