import { useCallback, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'

import Button from '@/components/Button'
import {
  DateField,
  NodeSelectField,
  SelectField,
  TextField,
} from '@/components/form'
import KeyboardDismiss from '@/components/KeyboardDismiss'

import { useTheme } from '@/containers/ThemeService'
import { NodeDetail } from '@/utils/v2ex-client/types'

type SortStr = 'sumup' | 'created_1' | 'created_0'
type FormValues = {
  q: string
  node?: string | NodeDetail
  username?: string
  lte?: Date
  gte?: Date
  sort_str?: SortStr
}
type Values = Omit<FormValues, 'lte' | 'gte' | 'sort_str' | 'node'> & {
  lte?: number
  gte?: number
  sort?: string
  order?: string // '1' | '0'
  node?: string
}

const renderLabel = (n: NodeDetail) => {
  return n.title || n.name
}

export default function AdvancedSearchForm(props: {
  initialValues: Values
  onSubmit: (values: Values) => void
}) {
  const sortOptions = useMemo<
    {
      value: SortStr
      label: string
    }[]
  >(
    () => [
      { value: 'sumup', label: '权重' },
      { value: 'created_1', label: '时间升序' },
      { value: 'created_0', label: '时间降序' },
    ],
    [],
  )
  const initialValues = useMemo(() => {
    let sort_str: string
    if (!props.initialValues.sort || props.initialValues.sort === 'sumup') {
      sort_str = 'sumup'
    } else if (props.initialValues.order) {
      sort_str = `created_${props.initialValues.order}`
    } else {
      sort_str = `created_0`
    }
    return {
      ...props.initialValues,
      lte: props.initialValues.lte
        ? new Date(props.initialValues.lte * 1000)
        : undefined,
      gte: props.initialValues.gte
        ? new Date(props.initialValues.gte * 1000)
        : undefined,
      sort_str: sort_str as SortStr,
    }
  }, [props.initialValues])
  const now = useMemo(() => new Date(), [])

  const onSubmit = useCallback(
    (values: FormValues) => {
      const { lte, gte, sort_str = 'sumup', node, ...rest } = values
      const [sort, order] = sort_str.split('_')
      const mapped = {
        ...rest,
        lte: lte ? lte.valueOf() / 1000 : undefined,
        gte: gte ? gte.valueOf() / 1000 : undefined,
        sort,
        order,
        node: typeof node === 'object' && node ? node.name : (node as string),
      }
      props.onSubmit(mapped)
    },
    [props],
  )

  const { styles } = useTheme()

  const form = useForm<FormValues>({
    values: initialValues,
  })

  const { watch, handleSubmit, reset } = form
  const lteVal = watch('lte')
  const gteVal = watch('gte')

  return (
    <FormProvider {...form}>
      <KeyboardDismiss>
        <View style={advFormStyles.container}>
          <View style={advFormStyles.fieldWrap}>
            <View style={advFormStyles.labelWrap}>
              <Text style={[advFormStyles.labelText, styles.text]}>关键词</Text>
            </View>
            <TextField
              name='q'
              autoFocus={!props.initialValues.q}
              label={false}
              placeholder='请输入查询的关键词'
              canClear
            />
          </View>
          <View style={advFormStyles.rowGap}>
            <View style={advFormStyles.flexCol}>
              <View style={advFormStyles.labelWrap}>
                <Text style={[advFormStyles.labelText, styles.text]}>节点</Text>
              </View>
              <NodeSelectField
                name='node'
                canClear
                label={false}
                placeholder='为空时，查询所有节点'
                renderLabel={renderLabel}
              />
            </View>
            <View style={advFormStyles.flexCol}>
              <View style={advFormStyles.labelWrap}>
                <Text style={[advFormStyles.labelText, styles.text]}>作者</Text>
              </View>
              <TextField
                name='username'
                label={false}
                placeholder='为空时，查询所有作者'
                canClear
              />
            </View>
          </View>
          <View style={advFormStyles.rowGap}>
            <View style={advFormStyles.flex1}>
              <View style={advFormStyles.labelWrap}>
                <Text style={[advFormStyles.labelText, styles.text]}>
                  发帖起始时间
                </Text>
              </View>
              <DateField
                name='gte'
                label={false}
                canClear
                pickerMode='date'
                placeholder='YYYY-MM-DD'
                maxDate={lteVal || now}
              />
            </View>
            <View style={advFormStyles.flexCol}>
              <View style={advFormStyles.labelWrap}>
                <Text style={[advFormStyles.labelText, styles.text]}>
                  发帖结束时间
                </Text>
              </View>
              <DateField
                name='lte'
                label={false}
                canClear
                pickerMode='date'
                placeholder='YYYY-MM-DD'
                minDate={gteVal}
                maxDate={now}
              />
            </View>
          </View>
          <View style={advFormStyles.sortRow}>
            <View style={advFormStyles.sortLabelWrap}>
              <Text style={[advFormStyles.labelText, styles.text]}>排序</Text>
            </View>
            <View style={advFormStyles.flex1}>
              <SelectField
                label={false}
                name='sort_str'
                options={sortOptions}
              />
            </View>
          </View>
          <View style={advFormStyles.rowGap}>
            <Button
              style={advFormStyles.resetBtn}
              onPress={() => {
                reset({
                  q: '',
                  sort_str: 'sumup',
                })
              }}
              variant='default'
              size='md'
              label='重置'
            />
            <Button
              style={advFormStyles.flex1}
              onPress={() => {
                handleSubmit(onSubmit)()
              }}
              variant='primary'
              size='md'
              label='搜索'
            />
          </View>
        </View>
      </KeyboardDismiss>
    </FormProvider>
  )
}

const advFormStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  fieldWrap: {
    marginBottom: 8,
  },
  labelWrap: {
    marginBottom: 4,
  },
  labelText: {
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  rowGap: {
    flexDirection: 'row',
    gap: 12,
  },
  flexCol: {
    marginBottom: 8,
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  sortRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  sortLabelWrap: {
    marginBottom: 4,
    marginRight: 12,
  },
  resetBtn: {
    minWidth: 100,
  },
})
