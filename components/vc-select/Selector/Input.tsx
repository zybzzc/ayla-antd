import { cloneElement } from '../../_util/vnode';
import type { ExtractPropTypes, PropType, VNode } from 'vue';
import { defineComponent, getCurrentInstance, inject, onMounted, withDirectives } from 'vue';
import PropTypes from '../../_util/vue-types';
import antInput from '../../_util/antInputDirective';
import classNames from '../../_util/classNames';
import type {
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  ChangeEventHandler,
  CompositionEventHandler,
  ClipboardEventHandler,
} from '../../_util/EventInterface';

export const inputProps = {
  inputRef: PropTypes.any,
  prefixCls: PropTypes.string,
  id: PropTypes.string,
  inputElement: PropTypes.VueNode,
  disabled: PropTypes.looseBool,
  autofocus: PropTypes.looseBool,
  autocomplete: PropTypes.string,
  editable: PropTypes.looseBool,
  activeDescendantId: PropTypes.string,
  value: PropTypes.string,
  open: PropTypes.looseBool,
  tabindex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Pass accessibility props to input */
  attrs: PropTypes.object,
  onKeydown: { type: Function as PropType<KeyboardEventHandler> },
  onMousedown: { type: Function as PropType<MouseEventHandler> },
  onChange: { type: Function as PropType<ChangeEventHandler> },
  onPaste: { type: Function as PropType<ClipboardEventHandler> },
  onCompositionstart: { type: Function as PropType<CompositionEventHandler> },
  onCompositionend: { type: Function as PropType<CompositionEventHandler> },
  onFocus: { type: Function as PropType<FocusEventHandler> },
  onBlur: { type: Function as PropType<FocusEventHandler> },
};

export type InputProps = Partial<ExtractPropTypes<typeof inputProps>>;

const Input = defineComponent({
  name: 'Input',
  inheritAttrs: false,
  props: inputProps,
  setup(props) {
    let blurTimeout = null;
    const VCSelectContainerEvent = inject('VCSelectContainerEvent') as any;

    if (process.env.NODE_ENV === 'test') {
      onMounted(() => {
        const ins = getCurrentInstance();
        if (props.autofocus) {
          if (ins.vnode && ins.vnode.el) {
            ins.vnode.el.focus();
          }
        }
      });
    }

    return () => {
      const {
        prefixCls,
        id,
        inputElement,
        disabled,
        tabindex,
        autofocus,
        autocomplete,
        editable,
        activeDescendantId,
        value,
        onKeydown,
        onMousedown,
        onChange,
        onPaste,
        onCompositionstart,
        onCompositionend,
        onFocus,
        onBlur,
        open,
        inputRef,
        attrs,
      } = props;

      let inputNode: any = inputElement || withDirectives((<input />) as VNode, [[antInput]]);

      const inputProps = inputNode.props || {};
      const {
        onKeydown: onOriginKeyDown,
        onInput: onOriginInput,
        onFocus: onOriginFocus,
        onBlur: onOriginBlur,
        onMousedown: onOriginMouseDown,
        onCompositionstart: onOriginCompositionStart,
        onCompositionend: onOriginCompositionEnd,
        style,
      } = inputProps;
      inputNode = cloneElement(
        inputNode,
        Object.assign(
          {
            id,
            ref: inputRef,
            disabled,
            tabindex,
            autocomplete: autocomplete || 'off',
            autofocus,
            class: classNames(`${prefixCls}-selection-search-input`, inputNode?.props?.class),
            style: { ...style, opacity: editable ? null : 0 },
            role: 'combobox',
            'aria-expanded': open,
            'aria-haspopup': 'listbox',
            'aria-owns': `${id}_list`,
            'aria-autocomplete': 'list',
            'aria-controls': `${id}_list`,
            'aria-activedescendant': activeDescendantId,
            ...attrs,
            value: editable ? value : '',
            readonly: !editable,
            unselectable: !editable ? 'on' : null,
            onKeydown: (event: KeyboardEvent) => {
              onKeydown(event);
              if (onOriginKeyDown) {
                onOriginKeyDown(event);
              }
            },
            onMousedown: (event: MouseEvent) => {
              onMousedown(event);
              if (onOriginMouseDown) {
                onOriginMouseDown(event);
              }
            },
            onInput: (event: Event) => {
              onChange(event);
              if (onOriginInput) {
                onOriginInput(event);
              }
            },
            onCompositionstart(event: CompositionEvent) {
              onCompositionstart(event);
              if (onOriginCompositionStart) {
                onOriginCompositionStart(event);
              }
            },
            onCompositionend(event: CompositionEvent) {
              onCompositionend(event);
              if (onOriginCompositionEnd) {
                onOriginCompositionEnd(event);
              }
            },
            onPaste,
            onFocus: (...args: any[]) => {
              clearTimeout(blurTimeout);
              onOriginFocus && onOriginFocus(args[0]);
              onFocus && onFocus(args[0]);
              VCSelectContainerEvent?.focus(args[0]);
            },
            onBlur: (...args: any[]) => {
              blurTimeout = setTimeout(() => {
                onOriginBlur && onOriginBlur(args[0]);
                onBlur && onBlur(args[0]);
                VCSelectContainerEvent?.blur(args[0]);
              }, 100);
            },
          },
          inputNode.type === 'textarea' ? {} : { type: 'search' },
        ),
        true,
        true,
      ) as VNode;
      return inputNode;
    };
  },
});

export default Input;
