import React, { Suspense } from 'react';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

class OverridableErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.log('cannot load', error, errorInfo);
  }

  render() {
    return this.state.hasError ? this.props.original : this.props.children
  }
}

export function overridable(WrappedComponent) {
  class Overridable extends React.Component {

    #overrided = null

    constructor(props) {
      super(props)
      console.log('props', props)
      console.log('this', this)
      const toOverrideName = getDisplayName(WrappedComponent)
      console.log('WrappedComponent', toOverrideName)
      try {
        this.#overrided = React.lazy(() => import(`Overrides/${toOverrideName}/${toOverrideName}`))
      } catch (e) {
        // do nothing
      }
    }

    render() {
      const {forwardedRef, ...rest} = this.props;
      const Overrided = this.#overrided;
      return <OverridableErrorBoundary original={<WrappedComponent ref={forwardedRef} {...rest} />}>
        <Suspense fallback={<div>Loading...</div>}>
          <Overrided ref={forwardedRef} {...rest} />
        </Suspense>
      </OverridableErrorBoundary>
    }
  }
  
  function forwardRef(props, ref) {
    return <Overridable {...props} forwardedRef={ref} />
  }
  forwardRef.displayName = `overridable(${getDisplayName(WrappedComponent)})`

  return React.forwardRef(forwardRef)
}
