export class TextParserUtil {

  static convertArticleTextToHtml(text: string): string {
    if (text) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      doc.querySelector('h1')?.remove();
      doc.body.firstElementChild?.classList.add('annotation');
      doc.querySelectorAll('h3').forEach(subTitle => subTitle?.classList.add('subtitle'));
      doc.querySelectorAll('p').forEach(paragraph => paragraph.classList.add('text'));
      doc.querySelectorAll('ul').forEach(list => list.classList.add('list-ul'));
      doc.querySelectorAll('ol').forEach(list => list.classList.add('list-ol'));
      return doc.body.innerHTML;
    }
    return '';
  }
}
