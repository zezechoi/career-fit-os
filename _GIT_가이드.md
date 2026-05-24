# GitHub 올리는 법 (한 번만 하면 됨)

> 이 파일은 안내용이라 레포에는 안 올려도 돼요. 따라 하고 지우면 됩니다.

---

## 1. 폴더 정리

레포 안에서 이렇게 배치하세요.

```
career-fit-os/
├── README.md                          # 표지 (레포 메인에 자동 표시)
├── docs/
│   ├── SPEC.md                        # 현행 기획서
│   ├── CHANGELOG.md                   # 변경 이력
│   └── DECISIONS.md                   # 의사결정 기록
├── archive/                           # 원본 기록 (보존용)
│   ├── career_fit_prompt.md           # 최초 기획서
│   └── 3주차_미션_Career_FIT_OS.md    # 회고
└── (기존 코드 파일들)
```

README는 레포 맨 위(루트)에 둬야 GitHub 메인에 자동으로 떠요.

---

## 2. 올리기

터미널에서 레포 폴더로 이동한 뒤:

```bash
git add README.md docs/ archive/
git commit -m "docs: 기획서·변경이력·의사결정 기록 정리"
git push
```

이 순간부터 GitHub 커밋 히스토리가 영구 백업이에요.
실수로 파일을 지워도 이전 커밋에서 복구됩니다.

---

## 3. 앞으로의 습관 (가볍게)

매번 할 필요 없어요. **"이건 기록해둬야겠다" 싶은 결정이 끝났을 때만** 하세요.

- 기능이 바뀌면 → `docs/SPEC.md` 갱신
- 큰 변화가 생기면 → `docs/CHANGELOG.md`에 한 줄 추가
- 중요한 선택을 했으면 → `docs/DECISIONS.md`에 이유 기록

그리고 커밋:
```bash
git add docs/
git commit -m "docs: <무엇을 바꿨는지 한 줄>"
git push
```

---

## 핵심 한 줄

채팅은 과정이고, 파일은 결과다.
결과만 GitHub에 안전하게 두면 과정은 사라져도 된다.
