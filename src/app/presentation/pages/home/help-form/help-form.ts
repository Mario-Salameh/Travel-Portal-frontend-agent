import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppService } from '../../../../core/services/app';
import { HasRoleDirective } from "../../../../core/directives/has-role-directive";

interface HelpCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tabIndex: number | null;
  overview: string;
  steps?: { title: string; description: string }[];
  tips?: string[];
  faqs?: { question: string; answer: string }[];
  fields?: { name: string; description: string; required: boolean }[];
  roles?: number[];
}

@Component({
  selector: 'app-help-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HasRoleDirective],
  templateUrl: './help-form.html',
})
export class HelpForm implements OnInit {
  appService = inject(AppService);
  private http = inject(HttpClient);

  categories = signal<HelpCategory[]>([]);
  searchQuery = signal('');
  expandedFaq = signal<string | null>(null);
  activeView = signal<'home' | 'category'>('home');
  selectedCategory = signal<HelpCategory | null>(null);
  activeContentTab = signal<'overview' | 'steps' | 'fields' | 'tips' | 'faq'>('overview');

  filteredCategories = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.categories();
    return this.categories().filter(cat => {
      const inTitle = cat.title.toLowerCase().includes(query);
      const inSubtitle = cat.subtitle.toLowerCase().includes(query);
      const inOverview = cat.overview.toLowerCase().includes(query);
      const inSteps = cat.steps?.some(s =>
        s.title.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)
      ) ?? false;
      const inFaqs = cat.faqs?.some(f =>
        f.question.toLowerCase().includes(query) || f.answer.toLowerCase().includes(query)
      ) ?? false;
      const inTips = cat.tips?.some(t => t.toLowerCase().includes(query)) ?? false;
      const inFields = cat.fields?.some(f =>
        f.name.toLowerCase().includes(query) || f.description.toLowerCase().includes(query)
      ) ?? false;
      return inTitle || inSubtitle || inOverview || inSteps || inFaqs || inTips || inFields;
    });
  });

  ngOnInit(): void {
    this.http.get<{ categories: HelpCategory[] }>('help-content.json')
      .subscribe(data => {
        this.categories.set(data.categories);
      });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    if (value.trim()) {
      this.activeView.set('home');
      this.selectedCategory.set(null);
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  openCategory(category: HelpCategory): void {
    this.selectedCategory.set(category);
    this.activeView.set('category');
    this.activeContentTab.set('overview');
    this.expandedFaq.set(null);
  }

  goBack(): void {
    this.activeView.set('home');
    this.selectedCategory.set(null);
    this.expandedFaq.set(null);
  }

  toggleFaq(id: string): void {
    this.expandedFaq.set(this.expandedFaq() === id ? null : id);
  }

  navigateTo(tabIndex: number): void {
    this.appService.selectedTabIndex.set(tabIndex);
  }

  setContentTab(tab: 'overview' | 'steps' | 'fields' | 'tips' | 'faq'): void {
    this.activeContentTab.set(tab);
    this.expandedFaq.set(null);
  }
}
