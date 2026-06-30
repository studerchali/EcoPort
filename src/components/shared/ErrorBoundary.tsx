import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message?: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[EcoPort] Error no capturado:', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: undefined })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md" role="alert">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle
                  className="h-6 w-6 text-destructive"
                  aria-hidden="true"
                />
              </div>
              <CardTitle>Algo salió mal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Ha ocurrido un error inesperado. Puedes recargar la aplicación.
              </p>
              {import.meta.env.DEV && this.state.message && (
                <pre className="max-h-32 overflow-auto rounded-md bg-muted p-3 text-left text-xs">
                  {this.state.message}
                </pre>
              )}
              <Button onClick={this.handleRetry} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                Recargar
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}