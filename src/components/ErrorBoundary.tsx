import React, { Component, type ReactNode } from 'react';
import type { ErrorInfo as ReactErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from './ui/collapsible';

export interface ErrorInfo {
	componentStack: string;
}

export interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
	errorId: string;
	retryCount: number;
}

export interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
	onRetry?: () => void;
	showDetails?: boolean;
	maxRetries?: number;
	enableSentry?: boolean;
	componentName?: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	private retryTimeoutId: ReturnType<typeof setTimeout> | null = null;

	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
			errorId: '',
			retryCount: 0,
		};
	}

	static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
		// Update state so the next render will show the fallback UI
		return {
			hasError: true,
			error,
			errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
		};
	}

	componentDidCatch(error: Error, errorInfo: ReactErrorInfo) {
		// Log error details
		const { onError, enableSentry, componentName } = this.props;

		// Add component stack to error info
		const componentStack =
			errorInfo.componentStack || 'No component stack available';
		const enhancedErrorInfo: ErrorInfo = {
			componentStack,
		};

		this.setState({
			errorInfo: enhancedErrorInfo,
		});

		// Log to console
		console.group('🚨 React Error Boundary Caught an Error');
		console.error('Error:', error);
		console.error('Error Info:', enhancedErrorInfo);
		console.error('Component Name:', componentName || 'Unknown');
		console.error('Error ID:', this.state.errorId);
		console.groupEnd();

		// Call custom error handler
		if (onError) {
			onError(error, enhancedErrorInfo);
		}

		// Send to Sentry if enabled
		if (enableSentry && typeof window !== 'undefined') {
			const sentry = (window as any).Sentry;
			if (sentry && typeof sentry.captureException === 'function') {
				try {
					sentry.captureException(error, {
						contexts: {
							react: {
								componentStack: enhancedErrorInfo.componentStack,
								componentName: componentName || 'Unknown',
							},
						},
						tags: {
							errorBoundary: true,
							errorId: this.state.errorId,
							componentName: componentName || 'Unknown',
						},
					});
				} catch (sentryError) {
					console.warn('Failed to send error to Sentry:', sentryError);
				}
			}
		}

		// Auto-retry for certain types of errors (network, async)
		if (this.shouldAutoRetry(error)) {
			this.scheduleRetry();
		}
	}

	componentWillUnmount() {
		if (this.retryTimeoutId) {
			clearTimeout(this.retryTimeoutId);
		}
	}

	private shouldAutoRetry(error: Error): boolean {
		const retryableErrors = [
			'Network Error',
			'Failed to fetch',
			'Network request failed',
			'Timeout',
		];

		return retryableErrors.some(
			(retryable) =>
				error.message.includes(retryable) || error.name.includes(retryable)
		);
	}

	private scheduleRetry() {
		const { maxRetries = 3 } = this.props;
		const { retryCount } = this.state;

		if (retryCount < maxRetries) {
			this.retryTimeoutId = setTimeout(() => {
				this.handleRetry();
			}, 2000 * (retryCount + 1)); // Exponential backoff
		}
	}

	private handleRetry = () => {
		const { maxRetries = 3, onRetry } = this.props;
		const { retryCount } = this.state;

		if (retryCount < maxRetries) {
			this.setState((prevState) => ({
				hasError: false,
				error: null,
				errorInfo: null,
				errorId: '',
				retryCount: prevState.retryCount + 1,
			}));

			if (onRetry) {
				onRetry();
			}
		}
	};

	private handleReset = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
			errorId: '',
			retryCount: 0,
		});
	};

	private handleReload = () => {
		window.location.reload();
	};

	private getErrorType(): string {
		const { error } = this.state;
		if (!error) return 'Unknown Error';

		if (error.message.includes('Network') || error.message.includes('fetch')) {
			return 'Network Error';
		}
		if (error.message.includes('TypeError')) {
			return 'Type Error';
		}
		if (error.message.includes('ReferenceError')) {
			return 'Reference Error';
		}
		if (error.message.includes('SyntaxError')) {
			return 'Syntax Error';
		}
		if (
			error.message.includes('ChunkLoadError') ||
			error.message.includes('Loading chunk')
		) {
			return 'Loading Error';
		}

		return 'Application Error';
	}

	private getErrorSeverity(): 'low' | 'medium' | 'high' {
		const { error } = this.state;
		if (!error) return 'medium';

		// High severity errors
		const highSeverityErrors = [
			'ChunkLoadError',
			'Loading chunk',
			'Failed to fetch',
			'Network Error',
		];

		// Low severity errors (warnings, non-critical)
		const lowSeverityErrors = [
			'Warning:',
			'Non-Error promise rejection captured',
		];

		if (highSeverityErrors.some((e) => error.message.includes(e))) {
			return 'high';
		}

		if (lowSeverityErrors.some((e) => error.message.includes(e))) {
			return 'low';
		}

		return 'medium';
	}

	private isDevelopment(): boolean {
		return import.meta.env.DEV;
	}

	render() {
		const { hasError, error, errorInfo, errorId, retryCount } = this.state;
		const {
			fallback,
			showDetails = this.isDevelopment(),
			maxRetries = 3,
			componentName,
		} = this.props;

		if (!hasError) {
			return this.props.children;
		}

		// Use custom fallback if provided
		if (fallback) {
			return (
				<>
					{fallback}
					{showDetails && error && (
						<div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
							<h4 className='text-red-800 font-semibold'>
								Error Details (Development)
							</h4>
							<pre className='text-red-700 text-sm mt-2 whitespace-pre-wrap'>
								{error.toString()}
								{errorInfo?.componentStack}
							</pre>
						</div>
					)}
				</>
			);
		}

		const errorType = this.getErrorType();
		const errorSeverity = this.getErrorSeverity();
		const canRetry = retryCount < maxRetries;
		const isNetworkError = errorType === 'Network Error';
		const isLoadingError = errorType === 'Loading Error';

		return (
			<div className='min-h-[400px] flex items-center justify-center p-4'>
				<Card className='w-full max-w-2xl'>
					<CardHeader className='text-center'>
						<div className='mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
							<AlertTriangle className='w-6 h-6 text-red-600' />
						</div>
						<CardTitle className='text-xl text-red-800'>
							{isNetworkError && 'Connection Problem'}
							{isLoadingError && 'Loading Error'}
							{!isNetworkError && !isLoadingError && 'Something went wrong'}
						</CardTitle>
						<CardDescription className='text-red-600'>
							{isNetworkError &&
								'Unable to connect to the server. Please check your internet connection.'}
							{isLoadingError &&
								'There was an issue loading the application. This might be a temporary problem.'}
							{!isNetworkError &&
								!isLoadingError &&
								'An unexpected error occurred. Our team has been notified.'}
						</CardDescription>
					</CardHeader>

					<CardContent className='space-y-6'>
						{/* Error ID for support */}
						<div className='text-center text-sm text-gray-500'>
							Error ID:{' '}
							<code className='bg-gray-100 px-2 py-1 rounded'>{errorId}</code>
						</div>

						{/* Retry Section */}
						{canRetry && (
							<div className='text-center space-y-3'>
								<p className='text-sm text-gray-600'>
									Attempting to recover... (Attempt {retryCount + 1} of{' '}
									{maxRetries})
								</p>
								<Button
									onClick={this.handleRetry}
									variant='outline'
									className='mx-auto'
								>
									<RefreshCw className='w-4 h-4 mr-2' />
									Retry Now
								</Button>
							</div>
						)}

						{/* Manual Recovery Actions */}
						<div className='flex flex-col sm:flex-row gap-3 justify-center'>
							<Button onClick={this.handleReset} variant='default'>
								<RefreshCw className='w-4 h-4 mr-2' />
								Try Again
							</Button>

							<Button onClick={this.handleReload} variant='outline'>
								<Home className='w-4 h-4 mr-2' />
								Reload Page
							</Button>
						</div>

						{/* Development Details */}
						{showDetails && error && (
							<Collapsible>
								<CollapsibleTrigger asChild>
									<Button variant='ghost' className='w-full justify-between'>
										<span className='flex items-center'>
											<Bug className='w-4 h-4 mr-2' />
											Technical Details (Development)
										</span>
									</Button>
								</CollapsibleTrigger>
								<CollapsibleContent className='mt-4'>
									<div className='bg-gray-50 border rounded-lg p-4 space-y-4'>
										<div>
											<h5 className='font-semibold text-sm text-gray-700'>
												Error Type:
											</h5>
											<p className='text-sm text-gray-600'>
												{errorType} ({errorSeverity} severity)
											</p>
										</div>

										{componentName && (
											<div>
												<h5 className='font-semibold text-sm text-gray-700'>
													Component:
												</h5>
												<p className='text-sm text-gray-600'>{componentName}</p>
											</div>
										)}

										<div>
											<h5 className='font-semibold text-sm text-gray-700'>
												Message:
											</h5>
											<p className='text-sm text-gray-600 font-mono bg-white p-2 rounded border'>
												{error.message}
											</p>
										</div>

										{error.stack && (
											<div>
												<h5 className='font-semibold text-sm text-gray-700'>
													Stack Trace:
												</h5>
												<pre className='text-xs text-gray-600 font-mono bg-white p-2 rounded border max-h-40 overflow-y-auto'>
													{error.stack}
												</pre>
											</div>
										)}

										{errorInfo?.componentStack && (
											<div>
												<h5 className='font-semibold text-sm text-gray-700'>
													Component Stack:
												</h5>
												<pre className='text-xs text-gray-600 font-mono bg-white p-2 rounded border max-h-40 overflow-y-auto'>
													{errorInfo.componentStack}
												</pre>
											</div>
										)}
									</div>
								</CollapsibleContent>
							</Collapsible>
						)}

						{/* Help Section */}
						<div className='text-center text-sm text-gray-500 border-t pt-4'>
							<p>
								If this problem persists, please contact support with the error
								ID above.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}
}

export default ErrorBoundary;
