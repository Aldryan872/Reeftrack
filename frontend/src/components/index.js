/**
 * components/index.js — Barrel export for all reusable components
 */

export * from './Sidebar.js';
export * from './StatCard.js';
export * from './ProductCard.js';
export * from './Modal.js';
export * from './Calendar.js';
export * from './OrdersTable.js';
export * from './Toast.js';

// Also re-export named defaults for convenience
export { default as Sidebar } from './Sidebar.js';
export { default as StatCard } from './StatCard.js';
export { default as ProductCard } from './ProductCard.js';
export { default as Modal } from './Modal.js';
export { default as Calendar } from './Calendar.js';
export { default as OrdersTable } from './OrdersTable.js';
export { default as Toast } from './Toast.js';
