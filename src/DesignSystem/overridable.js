import React, { Suspense } from 'react';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

function overridable(WrappedComponent) {
  const toOverrideName = getDisplayName(WrappedComponent)
  let overrided = null
  import(`Overrides/${toOverrideName}/${toOverrideName}`).then((module) => {
    overrided = module.default
  }).catch((reason) => {
    console.log('reason', reason)
  })

  class Overridable extends React.Component {
    constructor(props) {
      super(props)
    }

    render() {
      const { forwardedRef, ...rest } = this.props;
      console.log('this.#overrided', overrided)
      const Overrided = overrided || WrappedComponent
      return <Overrided ref={forwardedRef} {...rest} />
    }
  }

  function forwardRef(props, ref) {
    return <Overridable {...props} forwardedRef={ref} />
  }
  forwardRef.displayName = `overridable(${getDisplayName(WrappedComponent)})`

  return React.forwardRef(forwardRef)
}

export default overridable