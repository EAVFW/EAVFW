import { ModelDrivenSitemap } from '../Model/ModelDrivenSitemap';

export interface PageLayoutProps {
  children: React.ReactNode;
  sitemap: ModelDrivenSitemap;
  title: string;
  id?: string;
}
