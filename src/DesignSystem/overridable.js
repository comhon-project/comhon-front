import React from 'react';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

function overridable(WrappedComponent, edit = false) {
  const toOverrideName = getDisplayName(WrappedComponent)
  const folder = edit ? 'Edit' : 'Display';
  let overrided = null
  import(`Overrides/${folder}/${toOverrideName}/${toOverrideName}`).then((module) => {
    overrided = module.default
  }).catch(() => {
    // do nothing
  })

  class Overridable extends React.Component {
    render() {
      const { forwardedRef, ...rest } = this.props;
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