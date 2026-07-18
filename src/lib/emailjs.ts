import emailjs from '@emailjs/browser'

// EmailJS-configuratie. De "Public Key" is bewust geen geheim — EmailJS is
// juist ontworpen om rechtstreeks vanuit de browser aangeroepen te worden;
// hun eigen dashboard regelt rate-limiting/misbruikbeveiliging aan hun kant.
// Vandaar dat deze waarden gewoon als VITE_-env-variabelen mogen, net als de
// Firebase-config elders in dit project.
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string
const EMAILJS_TEMPLATE_WELCOME = import.meta.env.VITE_EMAILJS_TEMPLATE_WELCOME as string
const EMAILJS_TEMPLATE_ACCESS_CODE = import.meta.env.VITE_EMAILJS_TEMPLATE_ACCESS_CODE as string

let geinitialiseerd = false
function zorgVoorInit() {
  if (geinitialiseerd) return
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY })
  geinitialiseerd = true
}

/**
 * Stuurt de welkomstmail direct na een succesvolle registratie.
 * Merge-velden moeten exact overeenkomen met {{username}} en {{email}}
 * in het EmailJS-sjabloon "Welcome to GRID24HQ" (template_4mztf38).
 */
export async function stuurWelkomstmail(params: { username: string; email: string }) {
  zorgVoorInit()
  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_WELCOME, {
    username: params.username,
    email: params.email,
  })
}

/**
 * Stuurt de 6-cijferige toegangscode. Merge-veld {{access_code}} moet exact
 * overeenkomen met het EmailJS-sjabloon "Access code email" (template_2kqrvr4).
 */
export async function stuurToegangscode(params: { email: string; code: string }) {
  zorgVoorInit()
  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ACCESS_CODE, {
    email: params.email,
    access_code: params.code,
  })
}
