'use server';

import axios from 'axios';
import { HTMLElement, parse } from 'node-html-parser';

const USELESS_TAGS = [
  'head',
  'script',
  'style',
  'img',
  'iframe',
  'nav',
  'button',
];

const removeUselessTags = (root: HTMLElement) => {
  USELESS_TAGS.forEach((tag) => {
    root.querySelectorAll(tag).forEach((element) => element.remove());
  });
};

export async function fetchRecipeContent(url: string): Promise<string | null> {
  try {
    const page = await axios.get(url);
    const root = parse(page.data);
    removeUselessTags(root);
    const parsedAgain = parse(root.structuredText);
    return parsedAgain.structuredText.replaceAll('<!DOCTYPE html>', '').trim();
  } catch (error) {
    console.error('Error fetching recipe content:', error);
    return null;
  }
}
