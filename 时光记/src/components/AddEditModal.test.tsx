import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddEditModal from './AddEditModal';
import { useStore } from '../store';

describe('AddEditModal', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    useStore.getState().reset();
  });
  
  afterEach(() => {
    localStorage.clear();
  });
  
  it('should render modal when showAddModal is true', () => {
    useStore.getState().setShowAddModal(true);
    
    render(<AddEditModal />);
    
    expect(screen.getByRole('heading', { name: '添加日期' })).toBeInTheDocument();
  });
  
  it('should not render when showAddModal is false', () => {
    useStore.getState().setShowAddModal(false);
    
    const { container } = render(<AddEditModal />);
    
    expect(container.firstChild).toBeNull();
  });
  
  it('should add a new date when form is submitted', async () => {
    useStore.getState().setShowAddModal(true);
    
    render(<AddEditModal />);
    
    fireEvent.change(screen.getByLabelText('标题'), { target: { value: '测试日期' } });
    fireEvent.change(screen.getByLabelText('日期'), { target: { value: '2026-06-15' } });
    fireEvent.click(screen.getByRole('button', { name: '添加日期' }));
    
    await waitFor(() => {
      expect(useStore.getState().dates.length).toBe(1);
      expect(useStore.getState().dates[0].title).toBe('测试日期');
    });
  });
  
  it('should not add date when title is empty', async () => {
    useStore.getState().setShowAddModal(true);
    
    render(<AddEditModal />);
    
    fireEvent.change(screen.getByLabelText('日期'), { target: { value: '2026-06-15' } });
    fireEvent.click(screen.getByRole('button', { name: '添加日期' }));
    
    await waitFor(() => {
      expect(useStore.getState().dates.length).toBe(0);
    });
  });
  
  it('should switch between countdown and anniversary', () => {
    useStore.getState().setShowAddModal(true);
    
    render(<AddEditModal />);
    
    const countdownBtn = screen.getByRole('button', { name: '倒数日' });
    const anniversaryBtn = screen.getByRole('button', { name: '纪念日' });
    
    expect(countdownBtn).toHaveClass('bg-morandi-blue');
    expect(anniversaryBtn).not.toHaveClass('bg-morandi-pink');
    
    fireEvent.click(anniversaryBtn);
    
    expect(anniversaryBtn).toHaveClass('bg-morandi-pink');
    expect(countdownBtn).not.toHaveClass('bg-morandi-blue');
  });
  
  it('should select different categories', () => {
    useStore.getState().setShowAddModal(true);
    
    render(<AddEditModal />);
    
    const birthdayBtn = screen.getByRole('button', { name: '生日' });
    fireEvent.click(birthdayBtn);
    
    expect(birthdayBtn).toHaveStyle({ backgroundColor: '#E8B4B8' });
  });
  
  it('should close modal when X is clicked', () => {
    useStore.getState().setShowAddModal(true);
    
    render(<AddEditModal />);
    
    fireEvent.click(screen.getByRole('button', { name: '' }));
    
    expect(useStore.getState().showAddModal).toBe(false);
  });
});
