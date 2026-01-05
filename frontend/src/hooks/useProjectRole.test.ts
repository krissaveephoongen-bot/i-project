import { renderHook } from '@testing-library/react';
import { useProjectRole } from './useProjectRole';

describe('useProjectRole', () => {
  it('should grant manager permissions to project manager', () => {
    const { result } = renderHook(() =>
      useProjectRole('pm-123', 'pm-123', 'member')
    );

    expect(result.current.role).toBe('manager');
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canDelete).toBe(true);
    expect(result.current.canApprove).toBe(true);
    expect(result.current.canView).toBe(true);
  });

  it('should grant manager permissions to admin', () => {
    const { result } = renderHook(() =>
      useProjectRole('pm-123', 'user-456', 'admin')
    );

    expect(result.current.role).toBe('manager');
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canDelete).toBe(true);
    expect(result.current.canApprove).toBe(true);
  });

  it('should grant member permissions to team members', () => {
    const { result } = renderHook(() =>
      useProjectRole('pm-123', 'user-456', 'member')
    );

    expect(result.current.role).toBe('member');
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.canApprove).toBe(false);
    expect(result.current.canView).toBe(true);
  });

  it('should grant viewer permissions to others', () => {
    const { result } = renderHook(() =>
      useProjectRole('pm-123', 'user-456', 'viewer')
    );

    expect(result.current.role).toBe('viewer');
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.canApprove).toBe(false);
    expect(result.current.canView).toBe(true);
  });

  it('should handle missing user ID', () => {
    const { result } = renderHook(() =>
      useProjectRole('pm-123', undefined, 'member')
    );

    expect(result.current.canView).toBe(true);
  });

  it('should handle missing role', () => {
    const { result } = renderHook(() =>
      useProjectRole('pm-123', 'user-456', undefined)
    );

    expect(result.current.role).toBe('viewer');
  });
});
