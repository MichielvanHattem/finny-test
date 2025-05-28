
async function beantwoordVraag(vraag, data) {
  if (!vraag || !data) return "Geen geldige invoer.";

  if (vraag.toLowerCase().includes("winst")) {
    return `De winst volgens het bestand ${data.bestand || 'onbekend'} is ${data.winst} euro.`;
  } else {
    return "Ik kan deze vraag nog niet beantwoorden.";
  }
}

module.exports = { beantwoordVraag };
