/**
 * テスト用アカウント作成スクリプト
 * 実行: node --env-file=.env.local scripts/create-test-accounts.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ 環境変数が設定されていません。.env.local を確認してください。')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const ACCOUNTS = [
  {
    email: 'test@aichi-kitchencar.com',
    password: 'test1234',
    metadata: {
      company_name: 'テストキッチンカー',
      owner_name: 'テスト 太郎',
      phone: '090-0000-0001',
    },
    profile: {
      status: 'approved',
      is_admin: false,
      address: '愛知県名古屋市中区',
      business_type: '和食',
    },
    label: 'テスト会員',
  },
  {
    email: 'admin@aichi-kitchencar.com',
    password: 'admin1234',
    metadata: {
      company_name: '協会事務局',
      owner_name: '協会 管理者',
      phone: '052-000-0000',
    },
    profile: {
      status: 'approved',
      is_admin: true,
      address: '愛知県名古屋市',
      business_type: 'その他',
    },
    label: '管理者',
  },
]

async function trySignUp(account) {
  const { data, error } = await supabase.auth.signUp({
    email: account.email,
    password: account.password,
    options: { data: account.metadata },
  })
  if (error) {
    const isAlreadyExists =
      error.message.includes('already registered') ||
      error.message.includes('already been registered') ||
      error.message.includes('rate limit') ||
      error.message.includes('after 0 seconds')
    if (isAlreadyExists) {
      console.log(`  ℹ️  既にauth.usersに登録済みです。`)
      return 'exists'
    }
    console.error(`  ❌ サインアップ失敗: ${error.message}`)
    return 'error'
  }
  const uid = data.user?.id ?? '(メール確認待ち)'
  console.log(`  ✅ auth.users 作成完了 (id: ${uid})`)
  return 'created'
}

async function trySignIn(account) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  })
  if (error) {
    if (error.message.includes('Email not confirmed')) {
      console.log(`  ❌ メール未確認のためログインできません。`)
      console.log(`     → scripts/confirm-test-accounts.sql を Supabase SQL Editor で実行してください。`)
    } else {
      console.error(`  ❌ サインイン失敗: ${error.message}`)
    }
    return null
  }
  console.log(`  ✅ サインイン成功 (id: ${data.user.id})`)
  return data
}

async function updateProfile(session, account) {
  const { user, session: { access_token } } = session
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${access_token}` } },
  })

  const payload = {
    id: user.id,
    email: account.email,
    company_name: account.metadata.company_name,
    owner_name: account.metadata.owner_name,
    phone: account.metadata.phone,
    ...account.profile,
  }

  const { error } = await client.from('profiles').upsert(payload, { onConflict: 'id' })
  if (error) {
    console.error(`  ❌ profiles 更新失敗: ${error.message}`)
    return false
  }

  const { data: profile } = await client
    .from('profiles')
    .select('id, email, company_name, owner_name, status, is_admin')
    .eq('id', user.id)
    .single()

  if (profile) {
    console.log(`  ✅ profiles 設定完了:`)
    console.log(`     email    : ${profile.email}`)
    console.log(`     company  : ${profile.company_name}`)
    console.log(`     owner    : ${profile.owner_name}`)
    console.log(`     status   : ${profile.status}`)
    console.log(`     is_admin : ${profile.is_admin}`)
  }

  await client.auth.signOut()
  return true
}

async function createAccount(account) {
  console.log(`\n[${account.label}] ${account.email}`)

  await trySignUp(account)
  await new Promise(r => setTimeout(r, 800))

  const sessionData = await trySignIn(account)
  if (!sessionData) return false

  return updateProfile(sessionData, account)
}

async function main() {
  console.log('='.repeat(52))
  console.log(' テスト用アカウント作成スクリプト')
  console.log(`  URL: ${SUPABASE_URL}`)
  console.log('='.repeat(52))

  const results = []
  for (const account of ACCOUNTS) {
    results.push(await createAccount(account))
  }

  const allOk = results.every(Boolean)
  console.log('\n' + '='.repeat(52))

  if (allOk) {
    console.log('🎉 全アカウントの作成・設定が完了しました！\n')
    console.log('テスト会員:')
    console.log('  email   : test@aichi-kitchencar.com')
    console.log('  password: test1234')
    console.log('\n管理者:')
    console.log('  email   : admin@aichi-kitchencar.com')
    console.log('  password: admin1234')
  } else {
    console.log('⚠️  メール確認が必要です。\n')
    console.log('【手順】')
    console.log('  1. Supabase ダッシュボードを開く')
    console.log('     https://supabase.com/dashboard/project/qambinnqzwyzpqssrgii')
    console.log('  2. SQL Editor を開き scripts/confirm-test-accounts.sql の内容を貼り付けて実行')
    console.log('  3. このスクリプトをもう一度実行: node --env-file=.env.local scripts/create-test-accounts.mjs')
  }
  console.log('='.repeat(52))
}

main().catch(console.error)
