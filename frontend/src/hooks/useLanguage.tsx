import {useState} from "react";
import Content from "../interfaces/content";

const plContent = require('../content/pl.json') as Content
const enContent = require('../content/en.json') as Content

export default function useLanguage() {
    let defaultLanguage = navigator.language.split('-')[0]

    if(defaultLanguage !== 'pl' && defaultLanguage !== 'en') {
        defaultLanguage = 'en'
    }

    const savedLanguage = localStorage.getItem('language')

    if(savedLanguage) {
        defaultLanguage = savedLanguage
    }

    const [language, setLanguage] = useState(defaultLanguage);

    const changeLanguage = (language: 'pl'|'en') => {
        localStorage.setItem('language', language)
        setLanguage(language)
        window.location.reload()
    }

    const content = language === 'pl' ? plContent : enContent

    return { language, changeLanguage, content };
}
