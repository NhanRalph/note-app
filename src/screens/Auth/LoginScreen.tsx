import Button from '@/src/components/Button/Button';
import Colors from '@/src/constants/Colors';
import { useAppDispatch } from '@/src/hook/useDispatch';
import { useNavigation } from '@/src/hook/useNavigation';
import { RootState } from '@/src/redux/rootReducer';
import { login } from '@/src/redux/slices/authSlices';
import { loginSchema } from '@/src/utils/validationSchema';
import { Formik } from 'formik';
import { useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user) {
      navigation.navigate("Main", {
        screen: "Home",
      });
    }
  }, [user]);
  
  const initialValues = {
    email: '',
    password: '',
  }

  const handleSubmit = (values: { email: string; password: string }) => {
    console.log('Submitted values:', values);
    dispatch(login({ email: values.email, password: values.password }));

  };

  const goHome = () => {
    navigation.navigate('Main', {
      screen: 'Home',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập / Đăng ký</Text>

      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor="#999"
              secureTextEntry
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
            />
            {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

              <Button title="Đăng nhập" size="large" color={Colors.primary600} onPress={handleSubmit} loading={loading}/>
          </>
        )}
      </Formik>

      <Text style={styles.orText}>Hoặc tiếp tục với</Text>

      <View style={styles.socialContainer}>
        <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#DB4437' }]} onPress={goHome}>
          {/* <Image source={require('@/assets/google.png')} style={styles.socialIcon} /> */}
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#3b5998' }]}>
          {/* <Image source={require('@/assets/facebook.png')} style={styles.socialIcon} /> */}
          <Text style={styles.socialText}>Facebook</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    marginLeft: 4,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 16,
    color: '#666',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  socialText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
