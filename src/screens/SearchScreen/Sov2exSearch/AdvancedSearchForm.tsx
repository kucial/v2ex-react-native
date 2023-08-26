import { useCallback, useMemo } from 'react'
import { Text, View } from 'react-native'
import { Formik } from 'formik'

import Button from '@/components/Button'
import {
  DateField,
  NodeSelectField,
  SelectField,
  TextField,
} from '@/components/formik'
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
    Array<{
      value: SortStr
      label: string
    }>
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

  const handleSubmit = useCallback((values: FormValues) => {
    const { lte, gte, sort_str = 'sumup', node, ...rest } = values
    const [sort, order] = sort_str.split('_')
    const mapped = {
      ...rest,
      lte: lte ? lte.valueOf() / 1000 : undefined,
      gte: gte ? gte.valueOf() / 1000 : undefined,
      sort,
      order,
      node: typeof node === 'object' ? node.name : node,
    }
    props.onSubmit(mapped)
  }, [])

  const { styles } = useTheme()
  return (
    <Formik<FormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      enableReinitialize>
      {(formikProps) => (
        <KeyboardDismiss>
          <View className="px-4 pt-2 pb-4">
            <View className="mb-2">
              <View className="mb-1">
                <Text className="font-medium px-2" style={styles.text}>
                  关键词
                </Text>
              </View>
              <TextField
                name="q"
                autoFocus={!props.initialValues.q}
                label={false}
                placeholder="请输入查询的关键词"
                canClear
                bottomSheet
              />
            </View>
            <View className="flex-row gap-3">
              <View className="mb-2 flex-1">
                <View className="mb-1">
                  <Text className="font-medium px-2" style={styles.text}>
                    节点
                  </Text>
                </View>
                <NodeSelectField
                  name="node"
                  canClear
                  label={false}
                  placeholder="为空时，查询所有节点"
                  renderLabel={renderLabel}
                />
              </View>
              <View className="mb-2 flex-1">
                <View className="mb-1">
                  <Text className="font-medium px-2" style={styles.text}>
                    作者
                  </Text>
                </View>
                <TextField
                  name="username"
                  label={false}
                  placeholder="为空时，查询所有作者"
                  canClear
                  bottomSheet
                />
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <View className="mb-1">
                  <Text className="font-medium px-2" style={styles.text}>
                    发帖起始时间
                  </Text>
                </View>
                <DateField
                  name="gte"
                  label={false}
                  canClear
                  pickerMode="date"
                  placeholder="YYYY-MM-DD"
                  maxDate={formikProps.values.lte || now}
                />
              </View>
              <View className="flex-1 mb-2">
                <View className="mb-1">
                  <Text className="font-medium px-2" style={styles.text}>
                    发帖结束时间
                  </Text>
                </View>
                <DateField
                  name="lte"
                  label={false}
                  canClear
                  pickerMode="date"
                  placeholder="YYYY-MM-DD"
                  minDate={formikProps.values.gte}
                  maxDate={now}
                />
              </View>
            </View>
            <View className="flex-row mb-2 items-center">
              <View className="mb-1 mr-3">
                <Text className="font-medium px-2" style={styles.text}>
                  排序
                </Text>
              </View>
              <View className="flex-1">
                <SelectField
                  label={false}
                  name="sort_str"
                  options={sortOptions}
                />
              </View>
            </View>
            <View className="flex-row gap-3">
              <Button
                className="min-w-[100px]"
                onPress={() => {
                  formikProps.setValues({
                    q: '',
                    sort_str: 'sumup',
                  })
                }}
                variant="default"
                size="md"
                label="重置"></Button>
              <Button
                className="flex-1"
                onPress={() => {
                  formikProps.handleSubmit()
                }}
                variant="primary"
                size="md"
                label="搜索"></Button>
            </View>
          </View>
        </KeyboardDismiss>
      )}
    </Formik>
  )
}
