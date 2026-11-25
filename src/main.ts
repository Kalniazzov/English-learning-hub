import '@fontsource-variable/fredoka';
import '@fontsource-variable/literata';
import '@fontsource-variable/literata/wght-italic.css';
import './styles/tokens.css';
import './styles/book.css';
import './styles/components.css';
import { startBook } from './core/book';

if (import.meta.env.DEV && location.search === '?snapshots') {
  import('./core/snapshots').then((m) => m.makeSnapshots());
} else {
  startBook(document.getElementById('app')!);
}
