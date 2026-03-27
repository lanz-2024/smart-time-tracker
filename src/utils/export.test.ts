import { describe, expect, it } from 'vitest';
import type { Project, TimeEntry } from '../types';
import { exportToCsv, exportToJson, filterEntries } from './export';

const project: Project = {
  id: 'p1',
  name: 'My Project',
  color: '#ff0000',
  tasks: [{ id: 't1', projectId: 'p1', name: 'Task One', createdAt: '2024-01-01T00:00:00Z' }],
  createdAt: '2024-01-01T00:00:00Z',
};

const entry: TimeEntry = {
  id: 'e1',
  projectId: 'p1',
  taskId: 't1',
  startTime: '2024-01-02T09:00:00Z',
  endTime: '2024-01-02T10:00:00Z',
  duration: 3600,
  notes: 'some work',
  tags: ['billable', 'dev'],
  autoLogged: false,
};

describe('exportToCsv', () => {
  it('includes header row', () => {
    const csv = exportToCsv([entry], [project]);
    expect(csv.split('\n')[0]).toBe(
      'ID,Project,Task,Start Time,End Time,Duration (seconds),Notes,Tags,Auto Logged',
    );
  });

  it('maps project and task names', () => {
    const csv = exportToCsv([entry], [project]);
    const row = csv.split('\n')[1];
    expect(row).toContain('My Project');
    expect(row).toContain('Task One');
    expect(row).toContain('3600');
    expect(row).toContain('billable;dev');
    expect(row).toContain('no');
  });

  it('escapes fields with commas', () => {
    const e: TimeEntry = { ...entry, notes: 'hello, world' };
    const csv = exportToCsv([e], [project]);
    expect(csv).toContain('"hello, world"');
  });

  it('returns header only for empty entries', () => {
    const csv = exportToCsv([], [project]);
    expect(csv.split('\n')).toHaveLength(1);
  });
});

describe('exportToJson', () => {
  it('enriches entries with project and task names', () => {
    const json = JSON.parse(exportToJson([entry], [project]));
    expect(json[0].projectName).toBe('My Project');
    expect(json[0].taskName).toBe('Task One');
  });

  it('produces valid JSON', () => {
    expect(() => JSON.parse(exportToJson([entry], [project]))).not.toThrow();
  });
});

describe('filterEntries', () => {
  it('filters by dateFrom', () => {
    const result = filterEntries([entry], { format: 'csv', dateFrom: '2024-01-03T00:00:00Z' });
    expect(result).toHaveLength(0);
  });

  it('filters by dateTo', () => {
    const result = filterEntries([entry], { format: 'csv', dateTo: '2024-01-01T00:00:00Z' });
    expect(result).toHaveLength(0);
  });

  it('filters by projectIds', () => {
    const result = filterEntries([entry], { format: 'csv', projectIds: ['other'] });
    expect(result).toHaveLength(0);
  });

  it('returns entry when all filters pass', () => {
    const result = filterEntries([entry], {
      format: 'csv',
      dateFrom: '2024-01-01T00:00:00Z',
      dateTo: '2024-01-03T00:00:00Z',
      projectIds: ['p1'],
    });
    expect(result).toHaveLength(1);
  });
});
